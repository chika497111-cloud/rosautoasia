"use client";

import { useState } from "react";

export function QuantitySelector({ max, unit }: { max: number; unit: string }) {
  const [qty, setQty] = useState(1);

  return (
    <>
      <div className="flex items-center bg-surface-mid rounded-full p-1 border border-outline-variant/30">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-high text-primary transition-colors"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
        <span className="w-12 text-center font-bold text-lg">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(max, q + 1))}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-high text-primary transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
      <p className="text-xs text-on-surface-variant leading-tight">
        Максимум: {max} {unit}
      </p>
    </>
  );
}
