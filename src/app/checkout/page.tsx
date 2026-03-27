"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

type DeliveryMethod = "pickup" | "courier" | "regional";
type PaymentMethod = "cash" | "elsom" | "card";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, totalItems } = useCart();
  const { user, addOrder } = useAuth();
  const [comment, setComment] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [payment, setPayment] = useState<PaymentMethod>("elsom");
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const deliveryPrice = delivery === "pickup" ? 0 : delivery === "courier" ? 250 : 300;
  const grandTotal = totalPrice + deliveryPrice;

  if (items.length === 0 && !submitted) {
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
          Добавьте товары перед оформлением заказа
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

  if (!user && !submitted) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 py-24 text-center">
        <div className="w-24 h-24 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-[#451A03] font-[family-name:var(--font-headline)] tracking-tight mb-3">
          Войдите для оформления
        </h1>
        <p className="text-on-surface-variant text-lg mb-8">
          Чтобы оформить заказ и видеть историю покупок, нужно войти в аккаунт
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-block cta-gradient text-white font-[family-name:var(--font-headline)] font-bold px-10 py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="inline-block bg-surface-lowest text-[#451A03] font-[family-name:var(--font-headline)] font-bold px-10 py-4 rounded-full shadow-[0_10px_30px_rgba(69,26,3,0.04)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 py-24 text-center">
        <div className="w-24 h-24 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-[#451A03] font-[family-name:var(--font-headline)] tracking-tight mb-3">
          Заказ оформлен!
        </h1>
        <p className="text-on-surface-variant text-lg mb-2">
          Номер заказа: <span className="font-bold text-[#451A03]">{orderNumber}</span>
        </p>
        <p className="text-on-surface-variant mb-8">
          Мы свяжемся с вами по телефону для подтверждения
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account"
            className="inline-block cta-gradient text-white font-[family-name:var(--font-headline)] font-bold px-10 py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Мои заказы
          </Link>
          <Link
            href="/catalog"
            className="inline-block bg-surface-lowest text-[#451A03] font-[family-name:var(--font-headline)] font-bold px-10 py-4 rounded-full shadow-[0_10px_30px_rgba(69,26,3,0.04)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    );
  }

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const order = await addOrder({
        items: items.map((item) => ({
          name: item.product.name,
          article: item.product.article,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total: grandTotal,
        comment,
      });

      setOrderNumber(order.number);
      setSubmitted(true);
      clearCart();
    } catch {
      // Could show error to user
    } finally {
      setSubmitting(false);
    }
  };

  const deliveryOptions: {
    key: DeliveryMethod;
    icon: string;
    label: string;
    desc: string;
    price: string;
  }[] = [
    { key: "pickup", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Самовывоз", desc: "Склад г. Бишкек", price: "0 сом" },
    { key: "courier", icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0", label: "Курьер", desc: "В черте города", price: "250 сом" },
    { key: "regional", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Доставка по КР", desc: "Региональные службы", price: "от 300 сом" },
  ];

  const paymentOptions: {
    key: PaymentMethod;
    icon: string;
    label: string;
  }[] = [
    { key: "cash", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", label: "Наличные" },
    { key: "elsom", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", label: "Элсом / О!Деньги" },
    { key: "card", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", label: "Карта (VISA/Mastercard)" },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-screen-2xl mx-auto px-8 py-12">
      {/* Title */}
      <h1 className="text-4xl font-black text-[#451A03] font-[family-name:var(--font-headline)] tracking-tight mb-12">
        Оформление заказа
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Customer Form */}
        <div className="lg:col-span-7">
          <div className="bg-surface-lowest p-10 rounded-xl shadow-[0_10px_30px_rgba(69,26,3,0.04)]">
            <h3 className="font-[family-name:var(--font-headline)] font-bold text-[#451A03] text-xl mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</span>
              Данные получателя
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">ФИО</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  required
                  className="w-full bg-surface-mid border-none rounded-lg px-5 py-4 focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+996 (___) __ __ __"
                  required
                  className="w-full bg-surface-mid border-none rounded-lg px-5 py-4 focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full bg-surface-mid border-none rounded-lg px-5 py-4 focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Город</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Бишкек"
                  className="w-full bg-surface-mid border-none rounded-lg px-5 py-4 focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Адрес</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ул. Советская, 123"
                  className="w-full bg-surface-mid border-none rounded-lg px-5 py-4 focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Комментарий к заказу</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Укажите VIN код авто для проверки совместимости"
                  rows={3}
                  className="w-full bg-surface-mid border-none rounded-lg px-5 py-4 focus:ring-2 focus:ring-primary-container transition-all resize-none focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="lg:col-span-5 space-y-8">
          {/* Delivery Methods */}
          <div className="bg-surface-lowest p-8 rounded-xl shadow-[0_10px_30px_rgba(69,26,3,0.04)]">
            <h3 className="font-[family-name:var(--font-headline)] font-bold text-[#451A03] text-xl mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</span>
              Способ доставки
            </h3>
            <div className="space-y-3">
              {deliveryOptions.map((opt) => (
                <label
                  key={opt.key}
                  className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    delivery === opt.key
                      ? "border-primary-container bg-surface-low"
                      : "border-transparent bg-surface-mid hover:bg-surface-high"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    className="hidden"
                    checked={delivery === opt.key}
                    onChange={() => setDelivery(opt.key)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 mr-4 flex-shrink-0 ${delivery === opt.key ? "text-primary-container" : "text-on-surface-variant"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={opt.icon} />
                  </svg>
                  <div className="flex-grow">
                    <p className="font-bold text-[#451A03]">{opt.label}</p>
                    <p className="text-xs text-on-surface-variant">{opt.desc}</p>
                  </div>
                  <span className="font-bold text-[#451A03]">{opt.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-surface-lowest p-8 rounded-xl shadow-[0_10px_30px_rgba(69,26,3,0.04)]">
            <h3 className="font-[family-name:var(--font-headline)] font-bold text-[#451A03] text-xl mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</span>
              Способ оплаты
            </h3>
            <div className="space-y-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.key}
                  className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    payment === opt.key
                      ? "border-primary-container bg-surface-low"
                      : "border-transparent bg-surface-mid hover:bg-surface-high"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="hidden"
                    checked={payment === opt.key}
                    onChange={() => setPayment(opt.key)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 mr-4 flex-shrink-0 ${payment === opt.key ? "text-primary-container" : "text-on-surface-variant"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={opt.icon} />
                  </svg>
                  <p className="font-bold text-[#451A03]">{opt.label}</p>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final Action */}
      <div className="mt-16 flex flex-col items-center">
        <div className="max-w-xl w-full text-center">
          <p className="text-on-surface-variant text-sm mb-6">
            Нажимая кнопку &laquo;Подтвердить заказ&raquo;, вы соглашаетесь с условиями{" "}
            <Link href="#" className="text-primary underline">публичной оферты</Link>{" "}
            и политикой конфиденциальности.
          </p>
          <button
            type="submit"
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-[family-name:var(--font-headline)] font-extrabold text-xl py-6 rounded-full shadow-2xl shadow-primary/30 hover:scale-[1.03] active:scale-95 transition-all"
          >
            Подтвердить заказ &bull; {grandTotal.toLocaleString("ru-RU")} сом
          </button>
        </div>
      </div>
    </form>
  );
}
