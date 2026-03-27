"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validatePhone, formatPhoneInput } from "@/lib/phone-utils";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+996");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  if (user) {
    router.push("/account");
    return null;
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    setPhone(formatted);

    // Показываем ошибку только если пользователь уже начал вводить
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

    if (!name.trim()) {
      setError("Введите имя");
      return;
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "");
      return;
    }

    if (password.length < 4) {
      setError("Пароль должен быть не менее 4 символов");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }

    const result = register(name.trim(), phone.trim(), password);
    if (result.success) {
      router.push("/account");
    } else {
      setError(result.error || "Ошибка регистрации");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-on-surface mb-6 text-center">Регистрация</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-outline-variant/30 rounded-xl p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">Имя *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">Телефон *</label>
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

        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">Пароль *</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 4 символа"
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">Повторите пароль *</label>
          <input
            type="password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Повторите пароль"
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-container text-on-surface font-semibold py-3 rounded-lg hover:bg-primary-container/80 transition-colors"
        >
          Зарегистрироваться
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-primary hover:text-primary font-medium">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
