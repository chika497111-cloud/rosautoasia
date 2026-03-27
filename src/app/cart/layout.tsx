import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Корзина покупок ROSAutoAsia. Просмотрите выбранные товары и оформите заказ с доставкой по Кыргызстану.",
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
