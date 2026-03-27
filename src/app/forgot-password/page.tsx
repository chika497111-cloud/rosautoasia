"use client";

import { useState } from "react";
import Link from "next/link";
import { validatePhone, formatPhoneInput } from "@/lib/phone-utils";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("+996");
  const [phoneError, setPhoneError] = useState("");
  const [sent, setSent] = useState(false);

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    setPhone(formatted);

    if (formatted.length > 4) {
      const result = validatePhone(formatted);
      setPhoneError(result.valid ? "" : result.error || "");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "");
      return;
    }

    // TODO: Подключить SMS-провайдер для отправки кода
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-surface-lowest p-8 md:p-10 rounded-xl warm-shadow text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-mid rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-headline)] font-bold text-3xl text-[#451A03] mb-2 tracking-tight">
            SMS отправлено
          </h1>
          <p className="text-on-surface-variant mb-2">
            На номер <span className="font-medium text-on-surface">{phone}</span> отправлен код для сброса пароля.
          </p>
          <p className="text-sm text-outline mb-8">
            (Функция будет доступна после подключения SMS-сервиса)
          </p>
          <Link
            href="/login"
            className="inline-block cta-gradient text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Вернуться ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface-lowest p-8 md:p-10 rounded-xl warm-shadow">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-mid rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-headline)] font-bold text-3xl text-[#451A03] mb-2 tracking-tight">
            Восстановление пароля
          </h1>
          <p className="text-on-surface-variant font-medium">
            Мы отправим код подтверждения на ваш номер телефона
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              Телефон
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="770 000 000"
              className={`w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 text-on-surface placeholder:text-outline/50 transition-all ${
                phoneError
                  ? "ring-2 ring-error/40"
                  : "focus:ring-primary/20"
              }`}
            />
            {phoneError && (
              <p className="text-error text-xs mt-1 ml-1">{phoneError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full cta-gradient text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg"
          >
            Отправить код
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-on-surface-variant font-bold hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Вернуться к входу
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
