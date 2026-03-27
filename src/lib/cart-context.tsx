"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Product } from "./mock-data";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

const LS_KEY = "roa_cart";

function loadLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveLocalCart(items: CartItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

/** Merge localStorage cart into existing Firestore cart (additive — increases quantities) */
function mergeCarts(firestoreItems: CartItem[], localItems: CartItem[]): CartItem[] {
  const merged = [...firestoreItems];
  for (const local of localItems) {
    const existing = merged.find((m) => m.product.id === local.product.id);
    if (existing) {
      existing.quantity += local.quantity;
    } else {
      merged.push(local);
    }
  }
  return merged;
}

async function loadFirestoreCart(uid: string): Promise<CartItem[]> {
  try {
    const snap = await getDoc(doc(db, "users", uid, "meta", "cart"));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items)) return data.items;
    }
  } catch {}
  return [];
}

async function saveFirestoreCart(uid: string, items: CartItem[]) {
  try {
    await setDoc(doc(db, "users", uid, "meta", "cart"), { items });
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const uidRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  // Persist to Firestore or localStorage whenever items change (after init)
  useEffect(() => {
    if (!initializedRef.current) return;
    if (uidRef.current) {
      saveFirestoreCart(uidRef.current, items);
    } else {
      saveLocalCart(items);
    }
  }, [items]);

  // Auth state listener — load / merge cart on login, fall back to localStorage on logout
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        uidRef.current = fbUser.uid;
        const localItems = loadLocalCart();
        const firestoreItems = await loadFirestoreCart(fbUser.uid);
        const merged = mergeCarts(firestoreItems, localItems);
        setItems(merged);
        // Clear localStorage cart after merge
        try { localStorage.removeItem(LS_KEY); } catch {}
        // Save merged cart to Firestore
        if (localItems.length > 0) {
          await saveFirestoreCart(fbUser.uid, merged);
        }
      } else {
        uidRef.current = null;
        setItems(loadLocalCart());
      }
      initializedRef.current = true;
    });
    return () => unsub();
  }, []);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
