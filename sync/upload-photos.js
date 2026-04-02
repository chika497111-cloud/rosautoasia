/**
 * Upload product photos to Firebase Storage and update Firestore
 *
 * Usage:
 *   node sync/upload-photos.js [--force] [--dry-run] [--folder=path]
 *
 * Flags:
 *   --force    Re-upload even if product already has an image
 *   --dry-run  Preview what would be uploaded without actually uploading
 *   --folder=  Path to photos folder (default: C:\Users\chika\Desktop\photos\)
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

// --- Config ---
const DEFAULT_PHOTOS_FOLDER = "C:\\Users\\chika\\Desktop\\photos";
const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  "C:\\Users\\chika\\Downloads\\rosautoasia-firebase-adminsdk-fbsvc-1da9dc9503.json";
const STORAGE_BUCKET = "rosautoasia.firebasestorage.app";
const BATCH_SIZE = 10; // parallel uploads
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// --- Parse CLI args ---
function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {
    force: false,
    dryRun: false,
    folder: DEFAULT_PHOTOS_FOLDER,
  };

  for (const arg of args) {
    if (arg === "--force") flags.force = true;
    else if (arg === "--dry-run") flags.dryRun = true;
    else if (arg.startsWith("--folder=")) flags.folder = arg.split("=")[1];
    else {
      console.error(`Unknown argument: ${arg}`);
      console.error(
        "Usage: node sync/upload-photos.js [--force] [--dry-run] [--folder=path]"
      );
      process.exit(1);
    }
  }

  return flags;
}

// --- Initialize Firebase Admin ---
function initFirebase() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`Service account file not found: ${SERVICE_ACCOUNT_PATH}`);
    console.error(
      "Set GOOGLE_APPLICATION_CREDENTIALS env variable or place the file at the default path."
    );
    process.exit(1);
  }

  const serviceAccount = require(SERVICE_ACCOUNT_PATH);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: STORAGE_BUCKET,
  });

  return {
    db: admin.firestore(),
    bucket: admin.storage().bucket(),
  };
}

// --- Load products from Firestore, build code1c -> { id, hasImage } map ---
async function loadProductMap(db) {
  console.log("Loading products from Firestore...");
  const snapshot = await db.collection("products").get();
  const map = new Map();

  snapshot.forEach((doc) => {
    const data = doc.data();
    const code1c = data.code1c;
    if (code1c) {
      map.set(String(code1c).trim(), {
        id: doc.id,
        hasImage: Boolean(data.image),
      });
    }
  });

  console.log(`Loaded ${map.size} products with code1c from Firestore`);
  return map;
}

// --- Read photo files from folder ---
function readPhotoFiles(folder) {
  if (!fs.existsSync(folder)) {
    console.error(`Photos folder not found: ${folder}`);
    process.exit(1);
  }

  const files = fs.readdirSync(folder);
  const photos = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    const code1c = path.basename(file, ext);
    photos.push({
      code1c,
      filename: file,
      filepath: path.join(folder, file),
      ext,
    });
  }

  console.log(
    `Found ${photos.length} image files in ${folder} (${Array.from(SUPPORTED_EXTENSIONS).join(", ")})`
  );
  return photos;
}

// --- Upload a single photo ---
async function uploadPhoto(bucket, db, photo, productInfo) {
  const { filepath, ext } = photo;
  const { id: productId } = productInfo;

  const storagePath = `products/${productId}${ext}`;
  const contentTypeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };

  const file = bucket.file(storagePath);

  // Upload file
  await bucket.upload(filepath, {
    destination: storagePath,
    metadata: {
      contentType: contentTypeMap[ext] || "image/jpeg",
      cacheControl: "public, max-age=31536000",
    },
  });

  // Get Firebase download URL with token
  const metadata = await file.getMetadata();
  const token = metadata[0].metadata?.firebaseStorageDownloadTokens ||
    require("crypto").randomUUID();

  // Set download token if not present
  if (!metadata[0].metadata?.firebaseStorageDownloadTokens) {
    await file.setMetadata({
      metadata: { firebaseStorageDownloadTokens: token },
    });
  }

  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;

  // Update Firestore
  await db.collection("products").doc(productId).update({
    image: downloadUrl,
  });

  return downloadUrl;
}

// --- Process in batches ---
async function processBatches(bucket, db, tasks, dryRun) {
  let uploaded = 0;
  let failed = 0;
  let skipped = 0;
  const total = tasks.length;
  const errors = [];

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async ({ photo, productInfo }) => {
        if (dryRun) return "dry-run";
        return uploadPhoto(bucket, db, photo, productInfo);
      })
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const { photo } = batch[j];

      if (result.status === "fulfilled") {
        uploaded++;
      } else {
        failed++;
        const errMsg = `${photo.filename}: ${result.reason?.message || result.reason}`;
        errors.push(errMsg);
        console.error(`  FAILED: ${errMsg}`);
      }
    }

    const done = Math.min(i + BATCH_SIZE, total);
    const pct = ((done / total) * 100).toFixed(1);
    const prefix = dryRun ? "[DRY RUN] " : "";
    console.log(`${prefix}Uploaded ${done}/${total} photos (${pct}%)`);
  }

  return { uploaded, failed, skipped, errors };
}

// --- Main ---
async function main() {
  const flags = parseArgs();

  console.log("=== ROSAutoAsia Photo Uploader ===");
  console.log(`Folder:  ${flags.folder}`);
  console.log(`Force:   ${flags.force}`);
  console.log(`Dry run: ${flags.dryRun}`);
  console.log("");

  const { db, bucket } = initFirebase();
  const productMap = await loadProductMap(db);
  const photos = readPhotoFiles(flags.folder);

  // Match photos to products
  const tasks = [];
  let noMatch = 0;
  let alreadyHasImage = 0;

  for (const photo of photos) {
    const productInfo = productMap.get(photo.code1c);

    if (!productInfo) {
      noMatch++;
      continue;
    }

    if (productInfo.hasImage && !flags.force) {
      alreadyHasImage++;
      continue;
    }

    tasks.push({ photo, productInfo });
  }

  console.log("");
  console.log(`Matched:            ${tasks.length} photos to upload`);
  console.log(`No match in DB:     ${noMatch} photos skipped (no product with that code1c)`);
  console.log(`Already has image:  ${alreadyHasImage} photos skipped (use --force to overwrite)`);
  console.log("");

  if (tasks.length === 0) {
    console.log("Nothing to upload. Done.");
    return;
  }

  if (flags.dryRun) {
    console.log("[DRY RUN] Would upload these files:");
    for (const { photo, productInfo } of tasks) {
      console.log(`  ${photo.filename} -> products/${productInfo.id}${photo.ext}`);
    }
    console.log("");
  }

  const { uploaded, failed, errors } = await processBatches(
    bucket,
    db,
    tasks,
    flags.dryRun
  );

  console.log("");
  console.log("=== Summary ===");
  console.log(`Total processed: ${tasks.length}`);
  console.log(`Uploaded:        ${uploaded}`);
  console.log(`Failed:          ${failed}`);

  if (errors.length > 0) {
    console.log("");
    console.log("Failed uploads:");
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
