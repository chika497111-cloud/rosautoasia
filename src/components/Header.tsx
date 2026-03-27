"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export function CartBadge() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative p-2 hover:bg-primary-container/10 rounded-full transition-all shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

export function UserBadge() {
  const { user } = useAuth();

  if (user) {
    const isStaff = user.role === "admin" || user.role === "manager";
    const href = isStaff ? "/admin" : "/account";

    return (
      <Link href={href} className="flex items-center gap-2 p-2 hover:bg-primary-container/10 rounded-full transition-all shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="hidden lg:inline text-sm font-semibold text-on-surface-variant">{user.name}</span>
      </Link>
    );
  }

  return (
    <Link href="/login" className="flex items-center gap-2 p-2 hover:bg-primary-container/10 rounded-full transition-all shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span className="hidden lg:inline text-sm font-semibold text-on-surface-variant">Войти</span>
    </Link>
  );
}
