import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBw9HyAN-uCsLPmcaaCLFzw3D_p1n9hx1o",
  authDomain: "rosautoasia.firebaseapp.com",
  projectId: "rosautoasia",
  storageBucket: "rosautoasia.firebasestorage.app",
  messagingSenderId: "580201060895",
  appId: "1:580201060895:web:4762e47f95272e7220d32a",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
