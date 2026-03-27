"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/catalog", label: "Каталог" },
  { href: "/select-car", label: "Бренды" },
  { href: "/delivery", label: "Доставка" },
  { href: "/contacts", label: "Контакты" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-[family-name:var(--font-headline)] font-semibold text-base tracking-tight transition-colors ${
              isActive
                ? "text-primary-container border-b-2 border-primary-container pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
