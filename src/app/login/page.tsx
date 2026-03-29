"use client";

import { useState, useEffect } from "react";
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

  // Redirect authenticated users — use useEffect to avoid calling router.push during render
  useEffect(() => {
    if (user) {
      router.push("/account");
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-on-surface-variant">Перенаправление...</div>
      </div>
    );
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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(phone.trim(), password);
      if (result.success) {
        router.push("/account");
      } else {
        setError(result.error || "Ошибка входа");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface-lowest p-8 md:p-10 rounded-xl warm-shadow">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-headline)] font-bold text-3xl text-[#451A03] mb-2 tracking-tight">
            Вход в аккаунт
          </h1>
          <p className="text-on-surface-variant font-medium">Введите данные для входа</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              Телефон
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+996 555 123 456"
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              Пароль
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
            />
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary font-semibold hover:underline underline-offset-4"
              >
                Забыли пароль?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full cta-gradient text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg disabled:opacity-50"
          >
            {submitting ? "Вход..." : "Войти"}
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink mx-4 text-on-surface-variant text-sm font-medium">или</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <Link
            href="/register"
            className="block w-full text-center border-2 border-primary-container text-primary-container font-bold py-3.5 rounded-full hover:bg-primary-container/5 transition-colors"
          >
            Создать аккаунт
          </Link>
        </form>
      </div>
    </div>
  );
}
