import "server-only";

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth as _getAdminAuth } from "firebase-admin/auth";

function initAdmin() {
  if (getApps().length > 0) return getApp();

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminFirestore() {
  initAdmin();
  return getFirestore();
}

export function getAdminAuth() {
  initAdmin();
  return _getAdminAuth();
}
