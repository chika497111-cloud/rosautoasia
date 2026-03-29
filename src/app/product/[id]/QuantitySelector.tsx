"use client";

export function QuantitySelector({
  max,
  unit,
  value,
  onChange,
}: {
  max: number;
  unit: string;
  value: number;
  onChange: (qty: number) => void;
}) {
  return (
    <>
      <div className="flex items-center bg-surface-mid rounded-full p-1 border border-outline-variant/30">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-high text-primary transition-colors"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
        <span className="w-12 text-center font-bold text-lg">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
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
