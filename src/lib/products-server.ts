import "server-only";

import { getAdminFirestore } from "./firebase-admin";
import type { Product, Category } from "./mock-data";
import {
  categories as mockCategories,
  products as mockProducts,
  getProductById as mockGetProductById,
  getCategoryBySlug as mockGetCategoryBySlug,
  searchProducts as mockSearch,
} from "./mock-data";

// Car brands for extraction from category names
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

function firestoreToProduct(id: string, data: FirebaseFirestore.DocumentData): Product {
  const categoryName = (data.category as string) || "";
  return {
    id,
    name: (data.name as string) || "",
    article: (data.article as string) || "",
    category_id: categoryName.toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, ""),
    price: (data.price as number) || 0,
    quantity: (data.quantity as number) || 0,
    unit: (data.unit as string) || "шт",
    description: (data.description as string) || "",
    image: (data.image as string) || "",
    brand: (data.group as string) || "",
    car_brand: extractCarBrand(categoryName),
    car_model: "",
  };
}

function firestoreToCategory(id: string, data: FirebaseFirestore.DocumentData): Category & { productCount: number } {
  return {
    id,
    name: (data.name as string) || id,
    slug: id,
    parent_id: "",
    image: "",
    productCount: (data.productCount as number) || 0,
  };
}

// ---------------------------------------------------------------------------
// Server-side API functions using firebase-admin
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<(Category & { productCount: number })[]> {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("categories").orderBy("productCount", "desc").limit(50).get();
    if (snap.empty) throw new Error("empty");
    return snap.docs.map((d) => firestoreToCategory(d.id, d.data()));
  } catch {
    return mockCategories.map((c) => ({ ...c, productCount: 0 }));
  }
}

export async function getCategoryBySlug(slug: string): Promise<(Category & { productCount: number }) | null> {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("categories").doc(slug).get();
    if (!snap.exists) {
      const mock = mockGetCategoryBySlug(slug);
      return mock ? { ...mock, productCount: 0 } : null;
    }
    return firestoreToCategory(snap.id, snap.data()!);
  } catch {
    const mock = mockGetCategoryBySlug(slug);
    return mock ? { ...mock, productCount: 0 } : null;
  }
}

export async function getProductsByCategory(categorySlug: string, options?: { limit?: number }): Promise<Product[]> {
  try {
    const cat = await getCategoryBySlug(categorySlug);
    if (!cat) return [];
    const db = getAdminFirestore();
    const snap = await db.collection("products")
      .where("category", "==", cat.name)
      .limit(options?.limit || 100)
      .get();
    if (snap.empty) return mockProducts.filter((p) => p.category_id === categorySlug);
    return snap.docs.map((d) => firestoreToProduct(d.id, d.data()));
  } catch {
    return mockProducts.filter((p) => p.category_id === categorySlug);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("products").doc(id).get();
    if (!snap.exists) return mockGetProductById(id) || null;
    return firestoreToProduct(snap.id, snap.data()!);
  } catch {
    return mockGetProductById(id) || null;
  }
}

export async function getFeaturedProducts(count: number = 8): Promise<Product[]> {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("products")
      .where("active", "==", true)
      .limit(count)
      .get();
    if (snap.empty) return mockProducts.slice(0, count);
    return snap.docs.map((d) => firestoreToProduct(d.id, d.data()));
  } catch {
    return mockProducts.slice(0, count);
  }
}

export async function getTotalProductCount(): Promise<number> {
  try {
    const cats = await getCategories();
    return cats.reduce((sum, c) => sum + c.productCount, 0);
  } catch {
    return mockProducts.length;
  }
}

export async function searchProducts(queryStr: string): Promise<Product[]> {
  try {
    const q = queryStr.trim();
    if (!q) return [];
    const db = getAdminFirestore();

    // Search by article prefix
    const articleSnap = await db.collection("products")
      .where("article", ">=", q.toUpperCase())
      .where("article", "<=", q.toUpperCase() + "\uf8ff")
      .limit(30)
      .get();

    const results = articleSnap.docs.map((d) => firestoreToProduct(d.id, d.data()));

    if (results.length < 10) {
      // Also search by name prefix
      const nameSnap = await db.collection("products")
        .where("name", ">=", q)
        .where("name", "<=", q + "\uf8ff")
        .limit(20)
        .get();
      const existingIds = new Set(results.map((r) => r.id));
      nameSnap.docs.forEach((d) => {
        if (!existingIds.has(d.id)) {
          results.push(firestoreToProduct(d.id, d.data()));
        }
      });
    }

    return results.length > 0 ? results : mockSearch(q);
  } catch {
    return mockSearch(queryStr);
  }
}
