"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();

  const close = () => setIsOpen(false);

  const menuLinks = [
    { href: "/catalog", label: "Каталог" },
    { href: "/select-car", label: "Подбор по авто" },
    { href: "/favorites", label: "Избранное", badge: favorites.length },
    { href: "/delivery", label: "Доставка и оплата" },
    { href: "/contacts", label: "Контакты" },
    { href: "/about", label: "О компании" },
  ];

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex flex-col justify-center items-center gap-1.5 p-2"
        aria-label="Открыть меню"
      >
        <span className="block w-6 h-0.5 bg-[#584237] transition-all" />
        <span className="block w-6 h-0.5 bg-[#584237] transition-all" />
        <span className="block w-6 h-0.5 bg-[#584237] transition-all" />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-[#451A03] text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button onClick={close} className="p-2 hover:text-orange-400 transition-colors" aria-label="Закрыть меню">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-6 gap-1 overflow-y-auto">
          {menuLinks.map(({ href, label, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="flex items-center justify-between py-3 text-lg hover:text-orange-400 transition-colors"
            >
              <span>{label}</span>
              {badge != null && badge > 0 && (
                <span className="bg-primary-container text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                  {badge}
                </span>
              )}
            </Link>
          ))}

          {/* Divider */}
          <hr className="border-white/10 my-3" />

          {user ? (
            <>
              <Link
                href="/account"
                onClick={close}
                className="py-3 text-lg hover:text-orange-400 transition-colors"
              >
                Личный кабинет
              </Link>

              {(user.role === "admin" || user.role === "manager") && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="py-3 text-lg hover:text-orange-400 transition-colors"
                >
                  Админ-панель
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  close();
                }}
                className="py-3 text-lg text-left text-red-400 hover:text-red-300 transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={close}
                className="py-3 text-lg hover:text-orange-400 transition-colors"
              >
                Войти
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="py-3 text-lg hover:text-orange-400 transition-colors"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
