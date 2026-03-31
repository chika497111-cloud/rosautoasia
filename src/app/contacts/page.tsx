import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Контакты ROSAutoAsia. Адрес: Бишкек, ул. Льва Толстого, 126. Телефон: +996 700 123 456. WhatsApp, Telegram. Режим работы: Пн-Сб 09:00-19:00.",
  openGraph: {
    title: "Контакты — ROSAutoAsia",
    description:
      "Свяжитесь с ROSAutoAsia: телефон, WhatsApp, Telegram. Бишкек, ул. Льва Толстого, 126.",
    url: "https://raa.kg/contacts",
  },
};

export default function ContactsPage() {
  return (
    <div className="bg-surface">
      {/* Header */}
      <section className="bg-surface-low px-8 lg:px-24 pt-8 pb-4">
        <div className="max-w-screen-2xl mx-auto">
          <nav className="text-sm text-on-surface-variant mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-on-surface">Контакты</span>
          </nav>
        </div>
      </section>

      {/* Contacts Section */}
      <section className="py-24 px-8 lg:px-24 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-headline)] text-[#451A03] mb-16 text-center">
            Контакты
          </h1>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left column: info cards + form */}
            <div className="space-y-8">
              {/* Contact info cards */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-8 bg-surface-low rounded-xl space-y-3 transition-colors hover:bg-surface-mid">
                  <span className="material-symbols-outlined text-primary">call</span>
                  <p className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Телефон</p>
                  <p className="text-lg font-bold text-[#451A03]">
                    <a href="tel:+996700123456" className="hover:text-primary transition-colors">+996 700 123 456</a>
                  </p>
                </div>
                <div className="p-8 bg-surface-low rounded-xl space-y-3 transition-colors hover:bg-surface-mid">
                  <span className="material-symbols-outlined text-primary">mail</span>
                  <p className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Email</p>
                  <p className="text-lg font-bold text-[#451A03]">
                    <a href="mailto:info@rosautoasia.kg" className="hover:text-primary transition-colors">info@rosautoasia.kg</a>
                  </p>
                </div>
                <div className="p-8 bg-surface-low rounded-xl space-y-3 transition-colors hover:bg-surface-mid">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <p className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Адрес</p>
                  <p className="text-lg font-bold text-[#451A03]">Бишкек, рынок Дордой</p>
                </div>
                <div className="p-8 bg-surface-low rounded-xl space-y-3 transition-colors hover:bg-surface-mid">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <p className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Режим работы</p>
                  <p className="text-lg font-bold text-[#451A03]">Пн-Сб 09:00 - 19:00</p>
                </div>
              </div>

              {/* Messengers */}
              <div className="flex gap-3">
                <a
                  href="https://wa.me/996700123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white font-semibold py-3 rounded-full text-center hover:brightness-110 active:scale-95 transition-all"
                >
                  WhatsApp
                </a>
                <a
                  href="https://t.me/rosautoasia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#26A5E4] text-white font-semibold py-3 rounded-full text-center hover:brightness-110 active:scale-95 transition-all"
                >
                  Telegram
                </a>
              </div>

              {/* Contact Form */}
              <ContactForm />
            </div>

            {/* Right column: Google Maps */}
            <div className="h-full min-h-[500px] lg:sticky lg:top-32">
              <div className="w-full h-full rounded-xl overflow-hidden warm-shadow min-h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5849.5!2d74.5268!3d42.9056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x389eb7a44798de01%3A0x8d4d3a9f2a2e5f1a!2z0KDRi9C90L7QuiDQlNC-0YDQtNC-0Lk!5e0!3m2!1sru!2skg!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "16px", minHeight: "500px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ROSAutoAsia на карте"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
