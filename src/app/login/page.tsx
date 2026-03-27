"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validatePhone, formatPhoneInput } from "@/lib/phone-utils";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("+996");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  if (user) {
    router.push("/account");
    return null;
  }

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
    setError("");

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "");
      return;
    }

    const result = login(phone.trim(), password);
    if (result.success) {
      router.push("/account");
    } else {
      setError(result.error || "Ошибка входа");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-on-surface mb-6 text-center">Вход</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-outline-variant/30 rounded-xl p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

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
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-on-surface-variant">Пароль</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary">
              Забыли пароль?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ваш пароль"
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-container text-on-surface font-semibold py-3 rounded-lg hover:bg-primary-container/80 transition-colors"
        >
          Войти
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-primary hover:text-primary font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}
