import type { Metadata } from "next";
import Link from "next/link";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { CartBadge, UserBadge } from "@/components/Header";
import { MobileMenu } from "@/components/MobileMenu";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavLinks } from "@/components/NavLinks";
import { CompareBar } from "@/components/CompareBar";
import { SearchBar } from "@/components/SearchBar";
import { ClickSparkProvider } from "@/components/GlobalEffects";
import { SmoothScroll } from "@/components/SmoothScroll";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ROSAutoAsia — Автозапчасти в Бишкеке",
    template: "%s | ROSAutoAsia",
  },
  description:
    "Интернет-магазин автозапчастей ROSAutoAsia. Оригиналы и аналоги из Японии, Кореи и Китая с доставкой по Кыргызстану. Более 100,000 наименований.",
  keywords: [
    "автозапчасти",
    "Бишкек",
    "Кыргызстан",
    "запчасти",
    "Toyota",
    "Hyundai",
    "Kia",
    "оригинал",
    "аналоги",
    "ROSAutoAsia",
  ],
  authors: [{ name: "ROSAutoAsia" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://raa.kg",
    siteName: "ROSAutoAsia",
    title: "ROSAutoAsia — Автозапчасти в Бишкеке",
    description:
      "Оригинальные автозапчасти из Японии, Кореи и Китая с доставкой по Кыргызстану",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`h-full ${manrope.variable} ${inter.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9d4300" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ROSAutoAsia" />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-[family-name:var(--font-body)] antialiased">
        <Providers>
          <SmoothScroll />
          <ClickSparkProvider>
          <div className="scroll-progress" />
          <ScrollToTop />
          {/* Навигация */}
          <nav className="fixed top-0 w-full z-50 glass-nav">
            <div className="flex justify-between items-center px-4 sm:px-8 h-20 max-w-screen-2xl mx-auto w-full">
              {/* Лого */}
              <Link href="/" className="text-2xl font-black text-on-surface tracking-tighter font-[family-name:var(--font-headline)]">
                ROSAutoAsia
              </Link>

              {/* Навигация десктоп */}
              <div className="hidden md:flex gap-6 items-center">
                <NavLinks />
              </div>

              {/* Поиск десктоп */}
              <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
                <SearchBar />
              </div>

              {/* Правая часть */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="hidden sm:block">
                  <UserBadge />
                </div>
                <CartBadge />
                <MobileMenu />
              </div>
            </div>

            {/* Мобильный поиск */}
            <div className="lg:hidden px-4 pb-3">
              <SearchBar />
            </div>
          </nav>

          {/* Контент */}
          <main className="flex-1 pt-28 lg:pt-20">
            {children}
          </main>

          {/* Панель сравнения */}
          <CompareBar />

          {/* Подвал */}
          <footer className="rounded-t-[2rem] mt-20 bg-[#451A03] pt-16 pb-8 scroll-reveal">
            <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              <div>
                <div className="text-lg font-bold text-primary-container mb-4 font-[family-name:var(--font-headline)]">ROSAutoAsia</div>
                <p className="text-sm leading-relaxed text-[#FFFBEB]/70 mb-6">
                  Ваш надёжный партнёр в мире автозапчастей. Быстрая доставка по всему Кыргызстану.
                </p>
                <div className="flex gap-3">
                  <a href="https://wa.me/996555000000" target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#5d260a] flex items-center justify-center hover:bg-[#25D366] hover:scale-110 transition-all duration-300">
                    <svg className="w-5 h-5 text-[#FFFBEB]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                  <a href="https://t.me/rosautoasia" target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#5d260a] flex items-center justify-center hover:bg-[#0088cc] hover:scale-110 transition-all duration-300">
                    <svg className="w-5 h-5 text-[#FFFBEB]" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-primary-container mb-4">Магазин</h4>
                <div className="space-y-3">
                  {[
                    { href: "/catalog", label: "Каталог" },
                    { href: "/select-car", label: "Подбор по авто" },
                    { href: "/favorites", label: "Избранное" },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className="block text-sm text-[#FFFBEB]/60 hover:text-primary-container hover:translate-x-1 transition-all">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-primary-container mb-4">Поддержка</h4>
                <div className="space-y-3">
                  {[
                    { href: "/delivery", label: "Доставка и оплата" },
                    { href: "/about", label: "О компании" },
                    { href: "/contacts", label: "Контакты" },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className="block text-sm text-[#FFFBEB]/60 hover:text-primary-container hover:translate-x-1 transition-all">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-primary-container mb-4">Контакты</h4>
                <div className="space-y-3 text-sm text-[#FFFBEB]/60">
                  <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-container shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    г. Бишкек, ул. Примерная 1
                  </p>
                  <a href="tel:+996555000000" className="flex items-center gap-2 hover:text-primary-container transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-container shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    +996 555 000 000
                  </a>
                  <a href="mailto:info@rosautoasia.kg" className="flex items-center gap-2 hover:text-primary-container transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-container shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    info@rosautoasia.kg
                  </a>
                </div>
              </div>
            </div>
            <div className="max-w-screen-2xl mx-auto px-8 sm:px-12 mt-12 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-[#FFFBEB]/40">© {new Date().getFullYear()} ROSAutoAsia. Все права защищены.</p>
            </div>
          </footer>
          </ClickSparkProvider>
        </Providers>
      </body>
    </html>
  );
}
