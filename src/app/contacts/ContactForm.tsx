"use client";

import { useState, type FormEvent } from "react";
import { validatePhone } from "@/lib/phone-utils";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { sendContactEmail } from "./actions";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const newErrors: { name?: string; phone?: string; message?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Введите имя";
    }

    if (phone.trim()) {
      const phoneCheck = validatePhone(phone.trim());
      if (!phoneCheck.valid) {
        newErrors.phone = "Введите корректный номер телефона";
      }
    }

    if (!message.trim()) {
      newErrors.message = "Введите сообщение";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSending(true);

    try {
      // Save to Firestore + send email in parallel
      await Promise.all([
        addDoc(collection(db, "contact_requests"), {
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
          createdAt: new Date().toISOString(),
          status: "new",
        }),
        sendContactEmail({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      ]);

      // Send Telegram notification
      import("@/lib/telegram").then(({ notifyNewOrder }) => {
        // Reuse notifyNewOrder structure for contact requests
        const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";
        if (TELEGRAM_BOT_TOKEN) {
          fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=100`)
            .then((r) => r.json())
            .then((data) => {
              const chatIds = new Set<string>();
              for (const update of data.result || []) {
                const chatId = update.message?.chat?.id;
                if (chatId) chatIds.add(String(chatId));
              }
              const text = `📩 <b>Новая заявка с сайта</b>\n\n👤 ${name.trim()}\n📱 ${phone.trim() || "не указан"}\n\n💬 ${message.trim()}\n\n🔗 https://raa.kg/admin`;
              for (const chatId of chatIds) {
                fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
                }).catch(() => {});
              }
            })
            .catch(() => {});
        }
      }).catch(() => {});

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit contact form:", err);
      setErrors({ message: "Ошибка отправки. Попробуйте позже." });
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-primary-container/10 p-10 rounded-xl warm-shadow text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary-container/20 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
        </div>
        <h3 className="text-2xl font-bold font-[family-name:var(--font-headline)] text-[#451A03]">
          Спасибо! Ваша заявка отправлена.
        </h3>
        <p className="text-on-surface-variant font-medium">
          Мы свяжемся с вами в ближайшее время.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-lowest p-10 rounded-xl warm-shadow space-y-6">
      <h3 className="text-2xl font-bold font-[family-name:var(--font-headline)] text-[#451A03]">Оставить заявку</h3>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-sm font-semibold text-on-surface-variant mb-2">Имя</label>
          <input
            className="w-full bg-surface-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary focus:bg-surface-lowest transition-all"
            placeholder="Ваше имя"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
          />
          {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface-variant mb-2">Телефон</label>
          <input
            className="w-full bg-surface-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary focus:bg-surface-lowest transition-all"
            placeholder="+996 (___) __-__-__"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
          />
          {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface-variant mb-2">Сообщение</label>
          <textarea
            className="w-full bg-surface-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary focus:bg-surface-lowest transition-all"
            placeholder="Введите ваш вопрос или список запчастей"
            rows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
            }}
          />
          {errors.message && <p className="text-error text-sm mt-1">{errors.message}</p>}
        </div>
        <button
          className="w-full cta-gradient text-white font-bold py-4 rounded-full warm-shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          type="submit"
          disabled={sending}
        >
          {sending ? "Отправка..." : "Отправить"}
        </button>
      </form>
    </div>
  );
}
