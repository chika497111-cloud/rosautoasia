"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const menuLinks = [
    { href: "/catalog", label: "Каталог" },
    { href: "/select-car", label: "Подбор по авто" },
    { href: "/favorites", label: "Избранное", badge: favorites.length },
    { href: "/delivery", label: "Доставка и оплата" },
    { href: "/contacts", label: "Контакты" },
    { href: "/about", label: "О компании" },
  ];

  const menuContent = (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, pointerEvents: isOpen ? "auto" : "none" }}>
      {/* Overlay */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.75)",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        onClick={close}
      />

      {/* Panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: "320px",
          maxWidth: "85vw",
          backgroundColor: "#451A03",
          color: "white",
          overflowY: "auto",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.3)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
        }}
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
        <nav className="flex flex-col px-6 gap-1">
          {menuLinks.map(({ href, label, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="flex items-center justify-between py-3 text-lg hover:text-orange-400 transition-colors"
            >
              <span>{label}</span>
              {badge != null && badge > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                  {badge}
                </span>
              )}
            </Link>
          ))}

          <hr className="border-white/10 my-3" />

          {user ? (
            <>
              <Link href="/account" onClick={close} className="py-3 text-lg hover:text-orange-400 transition-colors">
                Личный кабинет
              </Link>
              {(user.role === "admin" || user.role === "manager") && (
                <Link href="/admin" onClick={close} className="py-3 text-lg hover:text-orange-400 transition-colors">
                  Админ-панель
                </Link>
              )}
              <button
                onClick={() => { logout(); close(); }}
                className="py-3 text-lg text-left text-red-400 hover:text-red-300 transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={close} className="py-3 text-lg hover:text-orange-400 transition-colors">
                Войти
              </Link>
              <Link href="/register" onClick={close} className="py-3 text-lg hover:text-orange-400 transition-colors">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex flex-col justify-center items-center gap-1.5 p-2"
        aria-label="Открыть меню"
      >
        <span className="block w-6 h-0.5 bg-[#584237] transition-all" />
        <span className="block w-6 h-0.5 bg-[#584237] transition-all" />
        <span className="block w-6 h-0.5 bg-[#584237] transition-all" />
      </button>

      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}
