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
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">SMS отправлено</h1>
        <p className="text-on-surface-variant mb-2">
          На номер <span className="font-medium text-on-surface">{phone}</span> отправлен код для сброса пароля.
        </p>
        <p className="text-sm text-outline mb-6">
          (Функция будет доступна после подключения SMS-сервиса)
        </p>
        <Link
          href="/login"
          className="inline-block bg-primary-container text-on-surface font-semibold px-6 py-3 rounded-lg hover:bg-primary-container/80 transition-colors"
        >
          Вернуться ко входу
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-on-surface mb-2 text-center">Сброс пароля</h1>
      <p className="text-on-surface-variant text-center mb-6">
        Введите номер телефона, на который зарегистрирован аккаунт. Мы отправим SMS с кодом для сброса пароля.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-outline-variant/30 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">Телефон</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+996 555 123 456"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
              phoneError
                ? "border-red-400 focus:ring-red-400"
                : "border-outline-variant focus:ring-primary-container/40"
            }`}
          />
          {phoneError && (
            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
          )}
          <p className="text-outline text-xs mt-1">Формат: +996 или +7</p>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-container text-on-surface font-semibold py-3 rounded-lg hover:bg-primary-container/80 transition-colors"
        >
          Отправить код
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          <Link href="/login" className="text-primary hover:text-primary font-medium">
            Вернуться ко входу
          </Link>
        </p>
      </form>
    </div>
  );
}
