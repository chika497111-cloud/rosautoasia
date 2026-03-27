import type { Metadata } from "next";
import Link from "next/link";

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
                  <p className="text-lg font-bold text-[#451A03]">Бишкек, ул. Льва Толстого, 126</p>
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
              <div className="bg-surface-lowest p-10 rounded-xl warm-shadow space-y-6">
                <h3 className="text-2xl font-bold font-[family-name:var(--font-headline)] text-[#451A03]">Оставить заявку</h3>
                <form className="space-y-4" action="#">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">Имя</label>
                    <input
                      className="w-full bg-surface-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary focus:bg-surface-lowest transition-all"
                      placeholder="Ваше имя"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">Телефон</label>
                    <input
                      className="w-full bg-surface-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary focus:bg-surface-lowest transition-all"
                      placeholder="+996 (___) __-__-__"
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">Сообщение</label>
                    <textarea
                      className="w-full bg-surface-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary focus:bg-surface-lowest transition-all"
                      placeholder="Введите ваш вопрос или список запчастей"
                      rows={4}
                    />
                  </div>
                  <button
                    className="w-full cta-gradient text-white font-bold py-4 rounded-full warm-shadow hover:opacity-90 active:scale-95 transition-all"
                    type="submit"
                  >
                    Отправить
                  </button>
                </form>
              </div>
            </div>

            {/* Right column: Map placeholder */}
            <div className="h-full min-h-[500px] lg:sticky lg:top-32">
              <div className="w-full h-full bg-surface-low rounded-xl flex items-center justify-center relative overflow-hidden warm-shadow group min-h-[500px]">
                {/* Grid lines decoration */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="grid grid-cols-12 h-full">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <div key={i} className="border-r border-primary col-span-1" />
                    ))}
                  </div>
                </div>

                <div className="text-center z-10 p-12">
                  <div className="w-20 h-20 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-primary text-4xl">map</span>
                  </div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-headline)] text-[#451A03] mb-4">Карта проезда</h3>
                  <p className="text-on-surface-variant max-w-sm mx-auto mb-8 font-medium">
                    Мы находимся в удобном районе Бишкека с просторной парковкой для клиентов.
                  </p>
                  <a
                    href="https://maps.google.com/?q=Bishkek+Lva+Tolstogo+126"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all"
                  >
                    Открыть Google Карты
                  </a>
                </div>

                {/* Bottom gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-surface-low to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
