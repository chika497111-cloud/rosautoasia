"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validatePhone, formatPhoneInput } from "@/lib/phone-utils";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+996");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Redirect already-authenticated users who navigate directly to /register
  // (not triggered by the register() call itself — handleSubmit does its own redirect)
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (user && !hasSubmitted) {
      router.replace("/account");
    }
    if (user && hasSubmitted) {
      router.replace("/");
    }
  }, [user, router, hasSubmitted]);

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

    if (!name.trim()) {
      setError("Введите имя");
      return;
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }

    setSubmitting(true);
    setHasSubmitted(true);
    try {
      const result = await register(name.trim(), phone.trim(), password);
      if (result.success) {
        router.push("/");
      } else {
        setHasSubmitted(false);
        setError(result.error || "Ошибка регистрации");
      }
    } catch {
      setHasSubmitted(false);
      setError("Произошла непредвиденная ошибка. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-surface-lowest p-8 md:p-10 rounded-xl warm-shadow">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-headline)] font-bold text-3xl text-[#451A03] mb-2 tracking-tight">
            Создать аккаунт
          </h1>
          <p className="text-on-surface-variant font-medium">Присоединяйтесь к сообществу профессионалов</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {error && (
            <div className="md:col-span-2 bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              ФИО
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иванов Иван Иванович"
              className="w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
            />
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.ru"
              className="w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
            />
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              Повторите пароль
            </label>
            <input
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full cta-gradient text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg disabled:opacity-50"
            >
              {submitting ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </div>

          <div className="md:col-span-2 text-center">
            <p className="text-on-surface-variant">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4 ml-1">
                Войти
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
