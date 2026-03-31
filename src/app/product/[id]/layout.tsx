import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Товар — ROSAutoAsia",
  description:
    "Автозапчасти ROSAutoAsia. Оригиналы и аналоги из Японии, Кореи и Китая с доставкой по Кыргызстану.",
  openGraph: {
    title: "Товар — ROSAutoAsia",
    description:
      "Автозапчасти с доставкой по Бишкеку и Кыргызстану.",
  },
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
