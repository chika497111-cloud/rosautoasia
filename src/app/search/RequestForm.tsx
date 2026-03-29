"use client";

import { useState, type FormEvent } from "react";

export function RequestForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-primary-container/20 border border-primary-container/40 rounded-2xl p-6 md:p-8 warm-shadow text-center space-y-4">
        <span
          className="material-symbols-outlined text-5xl text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <h3 className="font-[family-name:var(--font-headline)] text-2xl font-black text-on-surface">
          Заявка отправлена!
        </h3>
        <p className="text-on-surface-variant text-lg">
          Мы свяжемся с вами в течение 15 минут.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-surface-lowest rounded-2xl p-6 md:p-8 warm-shadow">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Марка авто
          </label>
          <input
            className="w-full bg-surface-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
            placeholder="Toyota"
            type="text"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Модель
          </label>
          <input
            className="w-full bg-surface-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
            placeholder="Camry"
            type="text"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Год выпуска
        </label>
        <input
          className="w-full bg-surface-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
          placeholder="2021"
          type="text"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Описание запчасти
        </label>
        <textarea
          className="w-full bg-surface-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
          placeholder="Опишите, что именно вы ищете..."
          rows={2}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Ваш телефон
        </label>
        <input
          className="w-full bg-surface-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
          placeholder="+996 (___) __-__-__"
          type="tel"
        />
      </div>
      <button
        type="submit"
        className="w-full cta-gradient text-white py-4 rounded-full font-black font-[family-name:var(--font-headline)] text-sm uppercase tracking-widest warm-shadow transition-all hover:opacity-90 active:scale-95 mt-4"
      >
        Отправить заявку
      </button>
    </form>
  );
}
