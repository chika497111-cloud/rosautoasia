"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const LS_KEY = "roa_favorites";

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoritesCount: number;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

function loadLocalFavorites(): string[] {
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

function saveLocalFavorites(favorites: string[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(favorites));
  } catch {}
}

async function loadFirestoreFavorites(uid: string): Promise<string[]> {
  try {
    const snap = await getDoc(doc(db, "users", uid, "meta", "favorites"));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items)) return data.items;
    }
  } catch {}
  return [];
}

async function saveFirestoreFavorites(uid: string, favorites: string[]) {
  try {
    await setDoc(doc(db, "users", uid, "meta", "favorites"), { items: favorites });
  } catch {}
}

/** Merge local + Firestore favorites (union, no duplicates) */
function mergeFavorites(firestoreFavs: string[], localFavs: string[]): string[] {
  return [...new Set([...firestoreFavs, ...localFavs])];
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const uidRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  // Persist whenever favorites change (after init)
  useEffect(() => {
    if (!initializedRef.current) return;
    if (uidRef.current) {
      saveFirestoreFavorites(uidRef.current, favorites);
    } else {
      saveLocalFavorites(favorites);
    }
  }, [favorites]);

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        uidRef.current = fbUser.uid;
        const localFavs = loadLocalFavorites();
        const firestoreFavs = await loadFirestoreFavorites(fbUser.uid);
        const merged = mergeFavorites(firestoreFavs, localFavs);
        setFavorites(merged);
        // Clear localStorage after merge
        try { localStorage.removeItem(LS_KEY); } catch {}
        // Save merged to Firestore if local had items
        if (localFavs.length > 0) {
          await saveFirestoreFavorites(fbUser.uid, merged);
        }
      } else {
        uidRef.current = null;
        setFavorites(loadLocalFavorites());
      }
      initializedRef.current = true;
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, favoritesCount, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
