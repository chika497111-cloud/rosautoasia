/**
 * Server & client functions to read products/categories from Firestore.
 * Falls back to mock-data if Firestore is unavailable or empty.
 *
 * Includes in-memory TTL cache to avoid hitting Firestore on every request
 * (critical for Vercel serverless where the 10-second timeout is tight).
 */

import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import type { Product, Category } from "./mock-data";
import {
  categories as mockCategories,
  products as mockProducts,
  searchProducts as mockSearch,
  getProductById as mockGetProductById,
  getCategoryBySlug as mockGetCategoryBySlug,
} from "./mock-data";

// ---------------------------------------------------------------------------
// In-memory TTL cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;

// ---------------------------------------------------------------------------
// Firestore → App type mappers
// ---------------------------------------------------------------------------

/** Known car brands that may appear in category names */
const CAR_BRANDS = [
  "ВАЗ", "ГАЗ", "ЗИЛ", "УАЗ", "КАМАЗ", "МАЗ", "УРАЛ",
  "Москвич", "Иномарки", "Тракторы",
];

function extractCarBrand(categoryName: string): string {
  for (const brand of CAR_BRANDS) {
    if (categoryName.includes(brand)) return brand;
  }
  return "";
}

/**
 * Convert a Firestore product document to the app's Product interface.
 * `docId` is the Firestore document ID, `data` is the document fields.
 */
export function firestoreProductToProduct(
  docId: string,
  data: Record<string, unknown>,
): Product {
  const categoryName = (data.category as string) || "";
  return {
    id: docId,
    name: (data.name as string) || "",
    article: (data.article as string) || "",
    category_id: categoryNameToSlug(categoryName),
    price: Number(data.price) || 0,
    quantity: Number(data.quantity) || 0,
    unit: (data.unit as string) || "шт.",
    description: (data.description as string) || "",
    image: (data.image as string) || "",
    brand: (data.group as string) || "",
    car_brand: extractCarBrand(categoryName),
    car_model: "",
  };
}

/** Simple slug generator: lowercase + replace spaces/special with dashes */
function categoryNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function firestoreCategoryToCategory(
  docId: string,
  data: Record<string, unknown>,
): Category & { productCount: number } {
  return {
    id: docId,
    name: (data.name as string) || "",
    slug: (data.slug as string) || docId,
    parent_id: null,
    image: "",
    productCount: Number(data.productCount) || 0,
  };
}

// ---------------------------------------------------------------------------
// Query limits — no query should ever load all 23k products
// ---------------------------------------------------------------------------

const CATEGORIES_LIMIT = 50;
const PRODUCTS_PER_CATEGORY_LIMIT = 100;
const SEARCH_RESULTS_LIMIT = 50;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get all categories sorted by productCount descending.
 * Limited to top 50 categories. Cached for 5 minutes.
 */
export async function getCategories(): Promise<
  (Category & { productCount: number })[]
> {
  const cacheKey = "categories";
  const cached = getCached<(Category & { productCount: number })[]>(cacheKey);
  if (cached) return cached;

  try {
    const q = query(
      collection(db, "categories"),
      orderBy("productCount", "desc"),
      firestoreLimit(CATEGORIES_LIMIT),
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("empty");

    const result = snap.docs.map((d) =>
      firestoreCategoryToCategory(d.id, d.data()),
    );
    setCache(cacheKey, result, FIVE_MINUTES);
    return result;
  } catch {
    // Fallback to mock
    const fallback = mockCategories.map((c) => ({ ...c, productCount: 0 }));
    setCache(cacheKey, fallback, ONE_MINUTE);
    return fallback;
  }
}

/**
 * Get a single category by its slug.
 * In Firestore the document ID === slug.
 * Cached for 5 minutes.
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<(Category & { productCount: number }) | null> {
  const cacheKey = `category:${slug}`;
  const cached = getCached<(Category & { productCount: number }) | null>(cacheKey);
  if (cached !== null) return cached;

  try {
    const ref = doc(db, "categories", slug);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      // Try mock fallback
      const mock = mockGetCategoryBySlug(slug);
      const result = mock ? { ...mock, productCount: 0 } : null;
      if (result) setCache(cacheKey, result, FIVE_MINUTES);
      return result;
    }
    const result = firestoreCategoryToCategory(snap.id, snap.data());
    setCache(cacheKey, result, FIVE_MINUTES);
    return result;
  } catch {
    const mock = mockGetCategoryBySlug(slug);
    const result = mock ? { ...mock, productCount: 0 } : null;
    if (result) setCache(cacheKey, result, ONE_MINUTE);
    return result;
  }
}

/**
 * Get products by category slug.
 * Products store the category *name*, so we first resolve slug → name,
 * then query products where category == name.
 * Default limit: 100 products per category. Cached for 5 minutes.
 */
export async function getProductsByCategory(
  categorySlug: string,
  options?: { limit?: number },
): Promise<Product[]> {
  const maxItems = options?.limit ?? PRODUCTS_PER_CATEGORY_LIMIT;
  const cacheKey = `products:${categorySlug}:${maxItems}`;
  const cached = getCached<Product[]>(cacheKey);
  if (cached) return cached;

  try {
    // Resolve slug → category name
    const cat = await getCategoryBySlug(categorySlug);
    if (!cat) return [];

    const categoryName = cat.name;
    const q = query(
      collection(db, "products"),
      where("category", "==", categoryName),
      firestoreLimit(maxItems),
    );

    const snap = await getDocs(q);
    if (snap.empty) return [];

    const result = snap.docs.map((d) => firestoreProductToProduct(d.id, d.data()));
    setCache(cacheKey, result, FIVE_MINUTES);
    return result;
  } catch {
    return [];
  }
}

/**
 * Get a single product by its Firestore document ID.
 * Also checks mock data for backwards compatibility with old IDs like "p1".
 */
export async function getProductById(
  id: string,
): Promise<Product | null> {
  const cacheKey = `product:${id}`;
  const cached = getCached<Product | null>(cacheKey);
  if (cached !== null) return cached;

  // Try Firestore first
  try {
    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const result = firestoreProductToProduct(snap.id, snap.data());
      setCache(cacheKey, result, FIVE_MINUTES);
      return result;
    }
  } catch {
    // fall through to mock
  }

  // Fallback to mock data (handles old IDs like "p1", "p2", etc.)
  const mock = mockGetProductById(id);
  return mock || null;
}

/**
 * Search products by name or article.
 * Uses Firestore >= / <= range queries on `name` field as a prefix search,
 * plus a secondary client-side filter by article.
 *
 * Limited to 50 results total. Cached for 1 minute.
 */
export async function searchProducts(
  queryStr: string,
): Promise<Product[]> {
  const trimmed = queryStr.trim();
  if (!trimmed) return [];

  const cacheKey = `search:${trimmed.toLowerCase()}`;
  const cached = getCached<Product[]>(cacheKey);
  if (cached) return cached;

  try {
    // Strategy 1: search by article (exact or prefix)
    const articleUpper = trimmed.toUpperCase();
    const articleQuery = query(
      collection(db, "products"),
      where("article", ">=", articleUpper),
      where("article", "<=", articleUpper + "\uf8ff"),
      firestoreLimit(20),
    );

    // Strategy 2: search by name prefix (case-sensitive, Cyrillic)
    // We try both the original case and capitalized first letter
    const nameVariants = [
      trimmed,
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      trimmed.toLowerCase(),
    ];

    const results = new Map<string, Product>();

    // Article search
    const articleSnap = await getDocs(articleQuery);
    for (const d of articleSnap.docs) {
      results.set(d.id, firestoreProductToProduct(d.id, d.data()));
    }

    // Name prefix search (try each variant)
    for (const variant of nameVariants) {
      if (results.size >= SEARCH_RESULTS_LIMIT) break;
      try {
        const nameQuery = query(
          collection(db, "products"),
          where("name", ">=", variant),
          where("name", "<=", variant + "\uf8ff"),
          firestoreLimit(20),
        );
        const nameSnap = await getDocs(nameQuery);
        for (const d of nameSnap.docs) {
          if (!results.has(d.id)) {
            results.set(d.id, firestoreProductToProduct(d.id, d.data()));
          }
        }
      } catch {
        // individual variant may fail, continue
      }
    }

    if (results.size > 0) {
      const resultArray = Array.from(results.values()).slice(0, SEARCH_RESULTS_LIMIT);
      setCache(cacheKey, resultArray, ONE_MINUTE);
      return resultArray;
    }

    // If nothing found in Firestore, fall back to mock
    const mockResults = mockSearch(trimmed);
    setCache(cacheKey, mockResults, ONE_MINUTE);
    return mockResults;
  } catch {
    return mockSearch(trimmed);
  }
}

/**
 * Get featured/popular products for homepage.
 * Returns products that are in stock, sorted by quantity descending.
 * Cached for 5 minutes.
 */
export async function getFeaturedProducts(
  count: number = 8,
): Promise<Product[]> {
  const cacheKey = `featured:${count}`;
  const cached = getCached<Product[]>(cacheKey);
  if (cached) return cached;

  try {
    const q = query(
      collection(db, "products"),
      where("active", "==", true),
      where("quantity", ">", 0),
      orderBy("quantity", "desc"),
      firestoreLimit(count),
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("empty");

    const result = snap.docs.map((d) => firestoreProductToProduct(d.id, d.data()));
    setCache(cacheKey, result, FIVE_MINUTES);
    return result;
  } catch {
    const fallback = mockProducts.slice(0, count);
    setCache(cacheKey, fallback, ONE_MINUTE);
    return fallback;
  }
}

/**
 * Get total product count (approximate — just sum category productCounts).
 * Cached along with getCategories.
 */
export async function getTotalProductCount(): Promise<number> {
  try {
    const cats = await getCategories();
    return cats.reduce((sum, c) => sum + c.productCount, 0);
  } catch {
    return mockProducts.length;
  }
}
