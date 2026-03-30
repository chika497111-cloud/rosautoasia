/**
 * Upload products from Excel (exported from 1C) to Firestore
 * Usage: node sync/upload-products.js
 */

const XLSX = require("xlsx");
const { initializeApp } = require("firebase/app");
const { getFirestore, writeBatch, doc } = require("firebase/firestore");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

const app = initializeApp({
  apiKey: "AIzaSyBw9HyAN-uCsLPmcaaCLFzw3D_p1n9hx1o",
  authDomain: "rosautoasia.firebaseapp.com",
  projectId: "rosautoasia",
  storageBucket: "rosautoasia.firebasestorage.app",
  messagingSenderId: "580201060895",
  appId: "1:580201060895:web:4762e47f95272e7220d32a",
});

const db = getFirestore(app);
const authInstance = getAuth(app);

const EXCEL_PATH = "C:/Users/chika/Desktop/products.xlsx";
const ADMIN_EMAIL = "996000000000@raa.kg";
const ADMIN_PASSWORD = "admin123";
const BATCH_SIZE = 500; // Firestore batch limit

async function main() {
  // Login as admin to get write permissions
  console.log("Logging in as admin...");
  await signInWithEmailAndPassword(authInstance, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log("Logged in!");

  console.log("Reading Excel file...");
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(ws);
  console.log(`Found ${rawData.length} rows in Excel`);

  // Transform data
  const products = rawData
    .filter((r) => r["Наименование"] && r["Отпускная цена KG"] > 0)
    .map((r, index) => {
      const name = String(r["Наименование"] || "").trim();
      const article = String(r["Артикул"] || "").trim();
      const code1c = String(r["Код товара"] || "").trim();
      const price = Number(r["Отпускная цена KG"]) || 0;
      const quantity = Number(r["Остаток"]) || 0;
      const unit = String(r["Ед.изм"] || "шт").trim();
      const category = String(r["Категория"] || "").trim();
      const group = String(r["В группе"] || "").trim();
      const warehouse = String(r["Склад"] || "").trim();

      // Generate slug-friendly ID from code1c
      const id = `p${code1c || index}`;

      return {
        id,
        name,
        article,
        code1c,
        price,
        quantity,
        unit,
        category,
        group,
        warehouse,
        image: "",
        description: "",
        active: quantity > 0,
        updatedAt: new Date().toISOString(),
      };
    });

  console.log(`Filtered to ${products.length} products with price > 0`);
  console.log(`In stock: ${products.filter((p) => p.quantity > 0).length}`);

  // Extract unique categories
  const categoriesMap = new Map();
  products.forEach((p) => {
    if (p.category && !categoriesMap.has(p.category)) {
      let slug = p.category
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]+/gi, "-")
        .replace(/^-|-$/g, "");
      if (!slug) slug = `cat-${categoriesMap.size}`;
      categoriesMap.set(p.category, {
        name: p.category,
        slug,
        productCount: 0,
      });
    }
    if (p.category && categoriesMap.has(p.category)) {
      categoriesMap.get(p.category).productCount++;
    }
  });

  const categories = Array.from(categoriesMap.values()).sort(
    (a, b) => b.productCount - a.productCount
  );

  console.log(`Found ${categories.length} categories`);
  console.log(
    "Top 10:",
    categories.slice(0, 10).map((c) => `${c.name} (${c.productCount})`)
  );

  // Upload categories
  console.log("\nUploading categories...");
  let batchObj = writeBatch(db);
  let batchCount = 0;

  for (const cat of categories) {
    const ref = doc(db, "categories", cat.slug);
    batchObj.set(ref, cat);
    batchCount++;
    if (batchCount >= BATCH_SIZE) {
      await batchObj.commit();
      console.log(`  Committed ${batchCount} categories`);
      batchObj = writeBatch(db);
      batchCount = 0;
    }
  }
  if (batchCount > 0) {
    await batchObj.commit();
    console.log(`  Committed ${batchCount} categories`);
  }

  // Upload products in batches
  console.log("\nUploading products...");
  batchObj = writeBatch(db);
  batchCount = 0;
  let totalUploaded = 0;

  for (const product of products) {
    const ref = doc(db, "products", product.id);
    const { id, ...data } = product;
    batchObj.set(ref, data);
    batchCount++;
    totalUploaded++;

    if (batchCount >= BATCH_SIZE) {
      await batchObj.commit();
      console.log(
        `  Committed batch: ${totalUploaded}/${products.length} (${Math.round((totalUploaded / products.length) * 100)}%)`
      );
      batchObj = writeBatch(db);
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batchObj.commit();
    console.log(
      `  Committed final batch: ${totalUploaded}/${products.length}`
    );
  }

  console.log(`\nDone! Uploaded ${totalUploaded} products and ${categories.length} categories to Firestore.`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
