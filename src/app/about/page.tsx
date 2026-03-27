import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "ROSAutoAsia — надёжный поставщик автозапчастей в Кыргызстане с 2015 года. Более 100,000 наименований, 50+ прямых контрактов с брендами, 10,000+ клиентов.",
  openGraph: {
    title: "О компании ROSAutoAsia",
    description:
      "Надёжный поставщик автозапчастей в Кыргызстане. Оригиналы из Японии, Кореи и Китая.",
    url: "https://raa.kg/about",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-surface">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden bg-surface-low px-8 lg:px-24 py-20">
        {/* Decorative blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto w-full">
          {/* Breadcrumb */}
          <nav className="text-sm text-on-surface-variant mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-on-surface">О компании</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-sm font-semibold tracking-wider uppercase">
                О компании
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold font-[family-name:var(--font-headline)] text-[#451A03] leading-[1.1]">
                О компании{" "}
                <span className="text-primary">ROSAutoAsia</span>
              </h1>
              <p className="text-xl text-on-surface-variant max-w-xl font-medium leading-relaxed">
                Надежный поставщик автозапчастей в Кыргызстане с 2015 года. Мы объединяем техническую точность и премиальный сервис.
              </p>
            </div>

            {/* Decorative image area */}
            <div className="relative hidden md:block">
              <div className="rounded-xl overflow-hidden warm-shadow-lg rotate-3 transform transition-transform hover:rotate-0 duration-500 bg-surface-mid h-[400px] flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/20 text-[120px]">precision_manufacturing</span>
              </div>
              <div className="absolute -bottom-8 -left-8 bg-surface-lowest p-6 rounded-xl warm-shadow-lg max-w-[200px]">
                <p className="text-primary-container font-bold text-4xl leading-none font-[family-name:var(--font-headline)]">9+ лет</p>
                <p className="text-on-surface-variant text-sm font-semibold mt-2">Опыта на рынке запчастей</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Stats */}
      <section className="py-24 px-8 lg:px-24 bg-surface">
        <div className="max-w-screen-2xl mx-auto space-y-20">
          {/* Mission Card */}
          <div className="bg-surface-lowest p-12 rounded-xl warm-shadow flex flex-col md:flex-row items-center gap-12 border-l-8 border-primary">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-bold font-[family-name:var(--font-headline)] text-[#451A03]">Наша миссия</h2>
              <p className="text-2xl text-on-surface-variant leading-relaxed italic font-light">
                «Обеспечение автовладельцев качественными и надежными деталями через инновационные логистические решения и экспертный подход к каждому узлу автомобиля.»
              </p>
            </div>
            <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-5xl">rocket_launch</span>
            </div>
          </div>

          {/* Stats Grid — 4 orange gradient cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "8+ лет", label: "непрерывной работы на рынке КР" },
              { value: "100,000+", label: "запчастей в постоянном наличии" },
              { value: "50+", label: "прямых контрактов с брендами" },
              { value: "10,000+", label: "довольных постоянных клиентов" },
            ].map((stat, i) => (
              <div
                key={i}
                className="cta-gradient p-8 rounded-xl text-white warm-shadow group hover:scale-[1.02] transition-transform"
              >
                <p className="text-4xl font-extrabold font-[family-name:var(--font-headline)] mb-2">{stat.value}</p>
                <p className="text-white/90 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Values — 3 cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "verified",
                title: "Качество",
                desc: "Только сертифицированные детали от проверенных мировых производителей.",
              },
              {
                icon: "bolt",
                title: "Скорость",
                desc: "Оптимизированная логистика позволяет доставлять заказы в кратчайшие сроки.",
              },
              {
                icon: "handshake",
                title: "Доверие",
                desc: "Прозрачные условия сотрудничества и гарантия на весь ассортимент.",
              },
            ].map((val, i) => (
              <div
                key={i}
                className="p-10 bg-surface-low rounded-xl space-y-4 transition-all hover:bg-surface-mid"
              >
                <div className="text-primary-container">
                  <span className="material-symbols-outlined text-4xl">{val.icon}</span>
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-headline)] text-[#451A03]">{val.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
