"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [promoCode, setPromoCode] = useState("");

  if (items.length === 0) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 py-24 text-center">
        <div className="w-24 h-24 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-[#451A03] font-[family-name:var(--font-headline)] tracking-tight mb-3">
          Корзина пуста
        </h1>
        <p className="text-on-surface-variant text-lg mb-8">
          Добавьте товары из каталога, чтобы оформить заказ
        </p>
        <Link
          href="/catalog"
          className="inline-block cta-gradient text-white font-[family-name:var(--font-headline)] font-bold px-10 py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-12">
      {/* Title + badge */}
      <div className="flex items-center gap-4 mb-10">
        <h1 className="text-4xl font-black text-[#451A03] font-[family-name:var(--font-headline)] tracking-tight">
          Корзина
        </h1>
        <span className="bg-surface-high px-4 py-1 rounded-full text-[#451A03] font-bold text-sm">
          ({totalItems} {totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"})
        </span>
        <button
          onClick={clearCart}
          className="ml-auto text-sm text-on-surface-variant hover:text-error transition-colors"
        >
          Очистить
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-surface-lowest p-6 rounded-xl shadow-[0_10px_30px_rgba(69,26,3,0.04)] flex flex-wrap md:flex-nowrap items-center gap-6"
            >
              {/* Thumbnail */}
              <div className="w-24 h-24 bg-surface-mid rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Name + article + brand */}
              <div className="flex-grow min-w-0">
                <Link
                  href={`/product/${item.product.id}`}
                  className="font-[family-name:var(--font-headline)] font-bold text-[#451A03] text-lg hover:text-primary transition-colors"
                >
                  {item.product.name}
                </Link>
                <p className="text-on-surface-variant text-sm mt-0.5">
                  {item.product.article}
                </p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  {item.product.brand}
                  {item.product.car_brand && ` | ${item.product.car_brand} ${item.product.car_model || ""}`}
                </p>
              </div>

              {/* Quantity +/- buttons */}
              <div className="flex items-center gap-4 bg-surface-mid rounded-full p-1">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors font-bold"
                >
                  -
                </button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-container text-white shadow-lg shadow-primary-container/20 font-bold"
                >
                  +
                </button>
              </div>

              {/* Price + subtotal */}
              <div className="text-right min-w-[120px]">
                {item.quantity > 1 && (
                  <p className="text-on-surface-variant text-xs mb-1">
                    {item.product.price.toLocaleString("ru-RU")} сом x {item.quantity}
                  </p>
                )}
                <p className="font-[family-name:var(--font-headline)] font-extrabold text-[#451A03] text-xl">
                  {(item.product.price * item.quantity).toLocaleString("ru-RU")} сом
                </p>
              </div>

              {/* Delete icon */}
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-on-surface-variant hover:text-error transition-colors shrink-0"
                title="Удалить"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-4 sticky top-28">
          <div className="bg-surface-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(69,26,3,0.08)]">
            <h2 className="font-[family-name:var(--font-headline)] font-extrabold text-[#451A03] text-2xl mb-6">
              Детали заказа
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-on-surface-variant">
                <span>Товары ({totalItems})</span>
                <span>{totalPrice.toLocaleString("ru-RU")} сом</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Доставка</span>
                <span className="text-primary font-bold">Бесплатно</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Промокод
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Введите код"
                  className="flex-grow bg-surface-mid border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container text-sm focus:outline-none transition-all"
                />
                <button className="bg-surface-low px-4 py-3 rounded-lg font-bold text-[#451A03] text-sm hover:bg-surface-high transition-all">
                  Применить
                </button>
              </div>
            </div>

            {/* Grand total */}
            <div className="pt-6 border-t border-surface-mid mb-8">
              <div className="flex justify-between items-end">
                <span className="font-bold text-[#451A03]">Итого к оплате</span>
                <span className="text-3xl font-black text-primary-container font-[family-name:var(--font-headline)]">
                  {totalPrice.toLocaleString("ru-RU")} сом
                </span>
              </div>
            </div>

            {/* CTA button */}
            <Link
              href="/checkout"
              className="block w-full bg-gradient-to-br from-primary to-primary-container text-white font-[family-name:var(--font-headline)] font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
            >
              Оформить заказ
            </Link>

            <p className="text-center text-on-surface-variant text-[10px] uppercase tracking-widest mt-6 font-medium">
              Безопасная оплата &bull; Гарантия возврата
            </p>

            <Link
              href="/catalog"
              className="block w-full text-center text-sm text-on-surface-variant hover:text-primary mt-4 transition-colors"
            >
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
