"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validatePhone, formatPhoneInput } from "@/lib/phone-utils";

/** Only letters (cyrillic + latin), spaces, hyphens */
function validateNameField(value: string): boolean {
  return /^[A-Za-zА-Яа-яЁёÀ-ÿ\s\-]+$/.test(value);
}

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+996");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [cityError, setCityError] = useState("");

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

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

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (value && !validateNameField(value)) {
      setFirstNameError("Введите только буквы");
    } else {
      setFirstNameError("");
    }
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    if (value && !validateNameField(value)) {
      setLastNameError("Введите только буквы");
    } else {
      setLastNameError("");
    }
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    if (value && !validateNameField(value)) {
      setCityError("Введите только буквы");
    } else {
      setCityError("");
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError("Введите имя");
      return;
    }
    if (!validateNameField(firstName.trim())) {
      setFirstNameError("Введите только буквы");
      return;
    }

    if (!lastName.trim()) {
      setError("Введите фамилию");
      return;
    }
    if (!validateNameField(lastName.trim())) {
      setLastNameError("Введите только буквы");
      return;
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "");
      return;
    }

    if (city.trim() && !validateNameField(city.trim())) {
      setCityError("Введите только буквы");
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
    try {
      const result = await register(
        firstName.trim(),
        lastName.trim(),
        phone.trim(),
        password,
        city.trim() || undefined,
      );
      if (!result.success) {
        setError(result.error || "Ошибка регистрации");
      }
      // If success — useEffect will redirect when user state updates
    } catch {
      setError("Произошла непредвиденная ошибка. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary-container/40 text-on-surface placeholder:text-outline/50 transition-all";
  const inputErrorClass =
    "w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 ring-2 ring-error/40 text-on-surface placeholder:text-outline/50 transition-all";

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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              Имя
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              placeholder="Иван"
              className={firstNameError ? inputErrorClass : inputClass}
            />
            {firstNameError && (
              <p className="text-error text-xs mt-1 ml-1">{firstNameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              Фамилия
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => handleLastNameChange(e.target.value)}
              placeholder="Иванов"
              className={lastNameError ? inputErrorClass : inputClass}
            />
            {lastNameError && (
              <p className="text-error text-xs mt-1 ml-1">{lastNameError}</p>
            )}
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
              className={phoneError ? inputErrorClass : inputClass}
            />
            {phoneError && (
              <p className="text-error text-xs mt-1 ml-1">{phoneError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              Город
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              placeholder="Бишкек"
              className={cityError ? inputErrorClass : inputClass}
            />
            {cityError && (
              <p className="text-error text-xs mt-1 ml-1">{cityError}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.ru"
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
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
