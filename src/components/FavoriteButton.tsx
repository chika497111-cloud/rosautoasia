"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/lib/favorites-context";
import { useAuth } from "@/lib/auth-context";

export function FavoriteButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const active = isFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
      return;
    }

    toggleFavorite(productId);
  };

  return (
    <div className="relative">
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-[#451A03] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg z-50 animate-fade-in">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push("/login");
            }}
            className="underline underline-offset-2 hover:opacity-80"
          >
            Войдите
          </button>
          {" "}чтобы добавить в избранное
        </div>
      )}
      <button
        onClick={handleClick}
        className={`group/fav transition-all duration-300 ${className}`}
        aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
        title={active ? "Убрать из избранного" : "В избранное"}
      >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 transition-all duration-300 ${
          active
            ? "fill-red-500 text-red-500 scale-110"
            : "fill-none text-outline-variant group-hover/fav:text-red-400 group-hover/fav:scale-110"
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      </button>
    </div>
  );
}
