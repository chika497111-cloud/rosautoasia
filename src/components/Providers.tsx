"use client";

import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
