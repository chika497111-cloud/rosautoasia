/**
 * OData Sync: 1С:УНФ → Firestore
 *
 * Reads products from 1C OData API, compares with Firestore,
 * updates changed products (price, quantity, name, etc.)
 *
 * Usage:
 *   node sync/odata-sync.js [--full] [--dry-run]
 *
 * Flags:
 *   --full     Force full sync (ignore last sync timestamp)
 *   --dry-run  Preview changes without writing to Firestore
 *
 * Environment / Config:
 *   ODATA_URL      - 1C OData base URL (default: http://localhost/unf/odata/standard.odata)
 *   ODATA_USER     - 1C username
 *   ODATA_PASSWORD - 1C password
 */

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// --- Config ---
const ODATA_BASE =
  process.env.ODATA_URL || "http://localhost/unf/odata/standard.odata";
const ODATA_USER = process.env.ODATA_USER || "";
const ODATA_PASSWORD = process.env.ODATA_PASSWORD || "";
const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  "C:\\Users\\chika\\Downloads\\rosautoasia-firebase-adminsdk-fbsvc-1da9dc9503.json";
const BATCH_SIZE = 500; // Firestore batch write limit
const ODATA_PAGE_SIZE = 1000; // How many records to fetch per OData request

// --- Parse CLI args ---
const args = process.argv.slice(2);
const FULL_SYNC = args.includes("--full");
const DRY_RUN = args.includes("--dry-run");

// --- Initialize Firebase ---
function initFirebase() {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return admin.firestore();
}

// --- OData helpers ---
function odataHeaders() {
  const headers = { Accept: "application/json" };
  if (ODATA_USER) {
    headers.Authorization =
      "Basic " +
      Buffer.from(`${ODATA_USER}:${ODATA_PASSWORD}`).toString("base64");
  }
  return headers;
}

async function odataFetch(url) {
  const response = await fetch(url, { headers: odataHeaders() });
  if (!response.ok) {
    throw new Error(`OData error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

/**
 * Fetch all products from 1C OData (paginated)
 */
async function fetchAllProducts1C() {
  console.log("Fetching products from 1С OData...");
  const allProducts = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${ODATA_BASE}/Catalog_Номенклатура?$format=json&$top=${ODATA_PAGE_SIZE}&$skip=${skip}&$filter=IsFolder eq false&$select=Ref_Key,Code,Description,Артикул,КодТовара,КодПоставщика,Вес,ДатаИзменения,Недействителен,КатегорияНоменклатуры_Key`;

    try {
      const data = await odataFetch(url);
      const items = data.value || [];
      allProducts.push(...items);

      console.log(`  Fetched ${allProducts.length} products...`);

      if (items.length < ODATA_PAGE_SIZE) {
        hasMore = false;
      } else {
        skip += ODATA_PAGE_SIZE;
      }
    } catch (err) {
      // If $select fails (field doesn't exist), try without select
      if (skip === 0 && err.message.includes("400")) {
        console.log("  Retrying without $select...");
        return fetchAllProductsSimple();
      }
      throw err;
    }
  }

  console.log(`Total products from 1С: ${allProducts.length}`);
  return allProducts;
}

/**
 * Fallback: fetch without $select (gets all fields)
 */
async function fetchAllProductsSimple() {
  const allProducts = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${ODATA_BASE}/Catalog_Номенклатура?$format=json&$top=${ODATA_PAGE_SIZE}&$skip=${skip}&$filter=IsFolder eq false`;
    const data = await odataFetch(url);
    const items = data.value || [];
    allProducts.push(...items);
    console.log(`  Fetched ${allProducts.length} products...`);

    if (items.length < ODATA_PAGE_SIZE) {
      hasMore = false;
    } else {
      skip += ODATA_PAGE_SIZE;
    }
  }

  console.log(`Total products from 1С: ${allProducts.length}`);
  return allProducts;
}

/**
 * Fetch categories from 1C to resolve category names
 */
async function fetchCategories1C() {
  console.log("Fetching categories from 1С...");
  try {
    const url = `${ODATA_BASE}/Catalog_КатегорииНоменклатуры?$format=json&$select=Ref_Key,Description`;
    const data = await odataFetch(url);
    const map = new Map();
    for (const cat of data.value || []) {
      map.set(cat.Ref_Key, cat.Description);
    }
    console.log(`  Loaded ${map.size} categories`);
    return map;
  } catch {
    console.log("  Categories catalog not available, will use product groups");
    return new Map();
  }
}

/**
 * Fetch prices from 1C (if available as separate register)
 */
async function fetchPrices1C() {
  console.log("Fetching prices from 1С...");
  try {
    const url = `${ODATA_BASE}/InformationRegister_ЦеныНоменклатуры?$format=json&$top=5`;
    const data = await odataFetch(url);
    // If we get data, fetch all
    if (data.value && data.value.length > 0) {
      const allUrl = `${ODATA_BASE}/InformationRegister_ЦеныНоменклатуры?$format=json`;
      const allData = await odataFetch(allUrl);
      const map = new Map();
      for (const price of allData.value || []) {
        // Key by product ref, store price
        const key = price.Номенклатура_Key || price.Номенклатура;
        if (key && price.Цена) {
          map.set(key, price.Цена);
        }
      }
      console.log(`  Loaded ${map.size} prices`);
      return map;
    }
  } catch {
    console.log("  Price register not available via OData");
  }
  return new Map();
}

/**
 * Transform 1C OData product to Firestore format
 */
function transform1CProduct(raw, categoriesMap, pricesMap) {
  const code = String(raw.Code || raw.КодТовара || "").trim();
  if (!code || code === "0") return null;

  const name = raw.Description || raw.НаименованиеПолное || "";
  const article = raw.Артикул || "";
  const categoryKey = raw.КатегорияНоменклатуры_Key || "";
  const categoryName = categoriesMap.get(categoryKey) || "";
  const isDeleted = raw.DeletionMark === true || raw.Недействителен === true;

  // Try to get price from prices register, fallback to 0
  const price = pricesMap.get(raw.Ref_Key) || 0;

  return {
    id: `p${code}`,
    name,
    article,
    code1c: code,
    category: categoryName,
    price,
    active: !isDeleted,
    updatedAt: new Date().toISOString(),
    // Keep existing fields (quantity, image, etc.) — don't overwrite
  };
}

/**
 * Load current Firestore products for comparison
 */
async function loadFirestoreProducts(db) {
  console.log("Loading current Firestore products...");
  const snap = await db.collection("products").get();
  const map = new Map();
  snap.docs.forEach((doc) => {
    const data = doc.data();
    map.set(doc.id, {
      name: data.name || "",
      article: data.article || "",
      price: data.price || 0,
      quantity: data.quantity || 0,
      category: data.category || "",
      active: data.active !== false,
      code1c: data.code1c || "",
    });
  });
  console.log(`  Loaded ${map.size} products from Firestore`);
  return map;
}

/**
 * Compare and find changes
 */
function findChanges(odata1CProducts, firestoreMap) {
  const toUpdate = [];
  const toCreate = [];
  let unchanged = 0;

  for (const product of odata1CProducts) {
    if (!product) continue;

    const existing = firestoreMap.get(product.id);

    if (!existing) {
      toCreate.push(product);
      continue;
    }

    // Check if anything changed
    const changed =
      existing.name !== product.name ||
      existing.article !== product.article ||
      existing.category !== product.category ||
      existing.active !== product.active ||
      (product.price > 0 && existing.price !== product.price);

    if (changed) {
      toUpdate.push(product);
    } else {
      unchanged++;
    }
  }

  return { toUpdate, toCreate, unchanged };
}

/**
 * Write changes to Firestore in batches
 */
async function writeChanges(db, toUpdate, toCreate, dryRun) {
  const total = toUpdate.length + toCreate.length;
  if (total === 0) {
    console.log("Nothing to update!");
    return;
  }

  console.log(
    `\nChanges: ${toCreate.length} new, ${toUpdate.length} updated`
  );

  if (dryRun) {
    console.log("\n[DRY RUN] Would create:");
    toCreate.slice(0, 5).forEach((p) => console.log(`  + ${p.name} (${p.id})`));
    if (toCreate.length > 5) console.log(`  ... and ${toCreate.length - 5} more`);

    console.log("\n[DRY RUN] Would update:");
    toUpdate.slice(0, 5).forEach((p) => console.log(`  ~ ${p.name} (${p.id})`));
    if (toUpdate.length > 5) console.log(`  ... and ${toUpdate.length - 5} more`);
    return;
  }

  // Batch write
  const allItems = [
    ...toCreate.map((p) => ({ ...p, _action: "create" })),
    ...toUpdate.map((p) => ({ ...p, _action: "update" })),
  ];

  let written = 0;
  for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
    const chunk = allItems.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const item of chunk) {
      const ref = db.collection("products").doc(item.id);
      const data = { ...item };
      delete data._action;
      delete data.id;

      if (item._action === "create") {
        batch.set(ref, data);
      } else {
        // Update: merge to keep existing fields (image, quantity, etc.)
        batch.set(ref, data, { merge: true });
      }
    }

    await batch.commit();
    written += chunk.length;
    console.log(`  Written ${written}/${allItems.length} (${((written / allItems.length) * 100).toFixed(1)}%)`);
  }

  console.log(`Done! ${written} products synced.`);
}

/**
 * Update sync metadata
 */
async function updateSyncMeta(db) {
  await db.collection("_sync_meta").doc("last_sync").set({
    timestamp: new Date().toISOString(),
    source: "odata-sync",
  });
}

// --- Main ---
async function main() {
  console.log("=== ROSAutoAsia OData Sync ===");
  console.log(`OData URL: ${ODATA_BASE}`);
  console.log(`Full sync: ${FULL_SYNC}`);
  console.log(`Dry run:   ${DRY_RUN}`);
  console.log("");

  const db = initFirebase();

  // Fetch data from 1C
  const [products1C, categoriesMap, pricesMap] = await Promise.all([
    fetchAllProducts1C(),
    fetchCategories1C(),
    fetchPrices1C(),
  ]);

  // Transform to Firestore format
  const transformed = products1C
    .map((p) => transform1CProduct(p, categoriesMap, pricesMap))
    .filter(Boolean);

  console.log(`\nTransformed ${transformed.length} products`);

  // Load Firestore current state
  const firestoreMap = await loadFirestoreProducts(db);

  // Find changes
  const { toUpdate, toCreate, unchanged } = findChanges(
    transformed,
    firestoreMap
  );

  console.log(`\nComparison:`);
  console.log(`  New:       ${toCreate.length}`);
  console.log(`  Updated:   ${toUpdate.length}`);
  console.log(`  Unchanged: ${unchanged}`);

  // Write changes
  await writeChanges(db, toUpdate, toCreate, DRY_RUN);

  // Update sync timestamp
  if (!DRY_RUN && (toUpdate.length > 0 || toCreate.length > 0)) {
    await updateSyncMeta(db);
  }

  console.log("\n=== Sync complete ===");
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
