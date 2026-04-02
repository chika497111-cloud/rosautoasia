"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validatePhone, formatPhoneInput } from "@/lib/phone-utils";

type Step = "phone" | "code" | "name";

export default function LoginPage() {
  const { loginWithToken, user, updateProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+996");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Redirect authenticated users
  useEffect(() => {
    if (user && user.name) {
      router.replace("/account");
    }
  }, [user, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus code input
  useEffect(() => {
    if (step === "code") {
      codeInputRef.current?.focus();
    }
  }, [step]);

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

  // Step 1: Send OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Не удалось отправить SMS");
        return;
      }

      setStep("code");
      setCountdown(60);
    } catch {
      setError("Ошибка сети. Проверьте подключение к интернету.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length < 4) {
      setError("Введите код из SMS");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Неверный код");
        return;
      }

      // Sign in with custom token
      await loginWithToken(data.token);

      if (data.isNewUser) {
        setStep("name");
      } else {
        router.replace("/account");
      }
    } catch {
      setError("Ошибка проверки кода. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Save name (new users)
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError("Введите имя");
      return;
    }

    setSubmitting(true);
    try {
      const success = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      if (success) {
        router.replace("/account");
      } else {
        setError("Не удалось сохранить данные. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка сохранения. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setCode("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCountdown(60);
      } else {
        setError(data.error || "Не удалось отправить SMS");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setSubmitting(false);
    }
  };

  if (user && user.name) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-on-surface-variant">Перенаправление...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface-lowest p-8 md:p-10 rounded-xl warm-shadow">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-headline)] font-bold text-3xl text-[#451A03] mb-2 tracking-tight">
            {step === "phone" && "Вход"}
            {step === "code" && "Код подтверждения"}
            {step === "name" && "Как вас зовут?"}
          </h1>
          <p className="text-on-surface-variant font-medium">
            {step === "phone" && "Введите номер телефона"}
            {step === "code" && (
              <>SMS отправлено на <span className="text-primary font-bold">{phone}</span></>
            )}
            {step === "name" && "Заполните профиль для завершения регистрации"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Phone */}
        {step === "phone" && (
          <form onSubmit={handleSendCode} className="space-y-6">
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
                className={`w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 text-on-surface placeholder:text-outline/50 transition-all text-lg ${
                  phoneError ? "ring-2 ring-error/40" : "focus:ring-primary/20"
                }`}
                autoFocus
              />
              {phoneError && (
                <p className="text-error text-xs mt-1 ml-1">{phoneError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full cta-gradient text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Отправка...
                </span>
              ) : (
                "Получить код"
              )}
            </button>
          </form>
        )}

        {/* Step 2: Code */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                Код из SMS
              </label>
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="0000"
                maxLength={4}
                className="w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface text-center text-3xl font-bold tracking-[0.5em] placeholder:text-outline/30 placeholder:tracking-[0.5em] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || code.length < 4}
              className="w-full cta-gradient text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Проверка...
                </span>
              ) : (
                "Подтвердить"
              )}
            </button>

            <div className="text-center space-y-3">
              {countdown > 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Отправить повторно через <span className="font-bold text-primary">{countdown} сек</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={submitting}
                  className="text-sm text-primary font-semibold hover:underline underline-offset-4 disabled:opacity-50"
                >
                  Отправить код повторно
                </button>
              )}

              <button
                type="button"
                onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors block mx-auto"
              >
                Изменить номер
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Name (new users) */}
        {step === "name" && (
          <form onSubmit={handleSaveName} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                Имя
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.replace(/[^а-яА-ЯёЁa-zA-Z\s\-]/g, ""))}
                placeholder="Иван"
                className="w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all text-lg"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                Фамилия <span className="normal-case text-outline">(необязательно)</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value.replace(/[^а-яА-ЯёЁa-zA-Z\s\-]/g, ""))}
                placeholder="Иванов"
                className="w-full px-4 py-4 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !firstName.trim()}
              className="w-full cta-gradient text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Сохранение...
                </span>
              ) : (
                "Завершить регистрацию"
              )}
            </button>
          </form>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {(["phone", "code", "name"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step ? "w-8 bg-primary" :
                i < ["phone", "code", "name"].indexOf(step) ? "w-4 bg-primary/40" :
                "w-4 bg-outline-variant/30"
              }`}
            />
          ))}
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
