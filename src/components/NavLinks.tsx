"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";

const links = [
  { href: "/catalog", label: "Каталог" },
  { href: "/select-car", label: "Бренды" },
  { href: "/delivery", label: "Доставка" },
  { href: "/contacts", label: "Контакты" },
];

export function NavLinks() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeIndex = links.findIndex(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  useEffect(() => {
    if (targetIndex < 0 || !navRef.current) {
      setPillStyle(null);
      return;
    }
    const navEl = navRef.current;
    const linkEl = navEl.children[targetIndex + 1] as HTMLElement; // +1 for the pill div
    if (!linkEl) return;

    const navRect = navEl.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();

    setPillStyle({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
    });
  }, [targetIndex]);

  return (
    <div ref={navRef} className="relative flex items-center gap-1">
      {/* Animated pill */}
      <div
        className="absolute top-0 h-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] pointer-events-none"
        style={{
          left: pillStyle ? pillStyle.left : 0,
          width: pillStyle ? pillStyle.width : 0,
          opacity: pillStyle ? 1 : 0,
          background: "rgba(249, 115, 22, 0.12)",
        }}
      />
      {links.map((item, i) => {
        const isActive = activeIndex === i;
        return (
          <Link
            key={item.href}
            href={item.href}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`relative z-10 font-[family-name:var(--font-headline)] font-semibold text-base tracking-tight px-4 py-2 rounded-full transition-colors duration-200 ${
              isActive
                ? "text-primary-container"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
