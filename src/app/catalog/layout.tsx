import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Каталог запчастей",
  description:
    "Каталог автозапчастей ROSAutoAsia. Тормозная система, двигатель, подвеска, фильтры, электрика и другие категории. Оригиналы и аналоги с доставкой по Кыргызстану.",
  openGraph: {
    title: "Каталог запчастей — ROSAutoAsia",
    description:
      "Полный каталог автозапчастей: оригиналы и аналоги для всех марок авто.",
    url: "https://raa.kg/catalog",
  },
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
