/**
 * Sync Orders: Firestore → 1С:УНФ via OData
 *
 * Reads new orders from Firestore (syncedTo1C !== true),
 * creates "ЗаказПокупателя" documents in 1C via OData POST,
 * then marks orders as synced.
 *
 * Usage:
 *   node sync/sync-orders.js [--dry-run]
 */

const admin = require("firebase-admin");

// --- Config ---
const ODATA_BASE =
  process.env.ODATA_URL || "http://localhost/unf/odata/standard.odata";
const ODATA_USER = process.env.ODATA_USER || "";
const ODATA_PASSWORD = process.env.ODATA_PASSWORD || "";
const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  "C:\\Users\\chika\\Downloads\\rosautoasia-firebase-adminsdk-fbsvc-1da9dc9503.json";

const DRY_RUN = process.argv.includes("--dry-run");

// --- Initialize Firebase ---
function initFirebase() {
  if (admin.apps.length === 0) {
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin.firestore();
}

// --- OData helpers ---
function odataHeaders() {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (ODATA_USER) {
    headers.Authorization =
      "Basic " +
      Buffer.from(`${ODATA_USER}:${ODATA_PASSWORD}`).toString("base64");
  }
  return headers;
}

/**
 * Find or create a customer (Контрагент) in 1C by phone
 */
async function findOrCreateCustomer(phone, name) {
  // Search by phone/name
  const searchUrl = `${ODATA_BASE}/Catalog_Контрагенты?$format=json&$filter=Description eq '${name}'&$top=1`;

  try {
    const response = await fetch(searchUrl, { headers: odataHeaders() });
    if (response.ok) {
      const data = await response.json();
      if (data.value && data.value.length > 0) {
        return data.value[0].Ref_Key;
      }
    }
  } catch {
    // Ignore search errors
  }

  // Create new customer
  const createUrl = `${ODATA_BASE}/Catalog_Контрагенты?$format=json`;
  try {
    const response = await fetch(createUrl, {
      method: "POST",
      headers: odataHeaders(),
      body: JSON.stringify({
        Description: name,
        Комментарий: `Телефон: ${phone}. Создан с сайта raa.kg`,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`  Created customer: ${name} (${data.Ref_Key})`);
      return data.Ref_Key;
    } else {
      console.error(`  Failed to create customer: ${response.status}`);
      return null;
    }
  } catch (err) {
    console.error(`  Error creating customer: ${err.message}`);
    return null;
  }
}

/**
 * Find product Ref_Key in 1C by code1c
 */
async function findProductRef(code1c) {
  const url = `${ODATA_BASE}/Catalog_Номенклатура?$format=json&$filter=Code eq '${code1c}'&$top=1&$select=Ref_Key`;

  try {
    const response = await fetch(url, { headers: odataHeaders() });
    if (response.ok) {
      const data = await response.json();
      if (data.value && data.value.length > 0) {
        return data.value[0].Ref_Key;
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Create order in 1C via OData
 */
async function createOrder1C(order, customerRef) {
  const orderUrl = `${ODATA_BASE}/Document_ЗаказПокупателя?$format=json`;

  // Build order items (табличная часть)
  const items = [];
  for (const item of order.items || []) {
    // Try to find product in 1C by article or name
    const code1c = item.article
      ? item.article.replace(/\D/g, "")
      : "";

    let productRef = null;
    if (code1c) {
      productRef = await findProductRef(code1c);
    }

    items.push({
      Номенклатура_Key: productRef || "00000000-0000-0000-0000-000000000000",
      Количество: item.quantity || 1,
      Цена: item.price || 0,
      Сумма: (item.price || 0) * (item.quantity || 1),
      Содержание: item.name || "",
    });
  }

  const orderData = {
    Date: new Date(order.createdAt || Date.now()).toISOString(),
    Контрагент_Key: customerRef || "00000000-0000-0000-0000-000000000000",
    Комментарий: [
      `Заказ с сайта #${order.number || order.id}`,
      order.comment ? `Комментарий: ${order.comment}` : "",
      order.deliveryMethod ? `Доставка: ${order.deliveryMethod}` : "",
      order.paymentMethod ? `Оплата: ${order.paymentMethod}` : "",
      order.deliveryAddress ? `Адрес: ${order.deliveryAddress}` : "",
      order.city ? `Город: ${order.city}` : "",
      `Телефон: ${order.userPhone || ""}`,
    ]
      .filter(Boolean)
      .join("\n"),
    Товары: items,
  };

  try {
    const response = await fetch(orderUrl, {
      method: "POST",
      headers: odataHeaders(),
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(
        `  Created order in 1C: ${order.number} -> ${data.Ref_Key}`
      );
      return data.Ref_Key;
    } else {
      const errText = await response.text();
      console.error(
        `  Failed to create order ${order.number}: ${response.status} ${errText.substring(0, 200)}`
      );
      return null;
    }
  } catch (err) {
    console.error(`  Error creating order: ${err.message}`);
    return null;
  }
}

/**
 * Get unsynced orders from Firestore
 */
async function getUnsyncedOrders(db) {
  const snap = await db
    .collection("orders")
    .where("syncedTo1C", "!=", true)
    .limit(50)
    .get();

  // Also get orders without syncedTo1C field
  const snap2 = await db
    .collection("orders")
    .limit(100)
    .get();

  const orders = new Map();

  // Add orders that explicitly have syncedTo1C != true
  snap.docs.forEach((doc) => {
    orders.set(doc.id, { id: doc.id, ...doc.data() });
  });

  // Add orders without syncedTo1C field
  snap2.docs.forEach((doc) => {
    const data = doc.data();
    if (data.syncedTo1C !== true) {
      orders.set(doc.id, { id: doc.id, ...data });
    }
  });

  return Array.from(orders.values());
}

// --- Main ---
async function main() {
  console.log("=== ROSAutoAsia Order Sync ===");
  console.log(`OData URL: ${ODATA_BASE}`);
  console.log(`Dry run:   ${DRY_RUN}`);
  console.log("");

  const db = initFirebase();

  // Get unsynced orders
  const orders = await getUnsyncedOrders(db);
  console.log(`Found ${orders.length} unsynced orders\n`);

  if (orders.length === 0) {
    console.log("Nothing to sync!");
    return;
  }

  let synced = 0;
  let failed = 0;

  for (const order of orders) {
    console.log(
      `Processing order ${order.number || order.id} (${order.userName}, ${order.total} сом)...`
    );

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would create order in 1C`);
      console.log(
        `  Items: ${(order.items || []).map((i) => i.name).join(", ")}`
      );
      synced++;
      continue;
    }

    // Find or create customer
    const customerRef = await findOrCreateCustomer(
      order.userPhone || "",
      order.userName || "Клиент с сайта"
    );

    // Create order in 1C
    const orderRef = await createOrder1C(order, customerRef);

    if (orderRef) {
      // Mark as synced in Firestore
      await db.collection("orders").doc(order.id).update({
        syncedTo1C: true,
        code1C: orderRef,
        syncedAt: new Date().toISOString(),
      });
      synced++;
    } else {
      failed++;
    }
  }

  console.log(`\n=== Done: ${synced} synced, ${failed} failed ===`);
}

main().catch((err) => {
  console.error("Order sync failed:", err);
  process.exit(1);
});
