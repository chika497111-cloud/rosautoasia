import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оформление заказа",
  description: "Оформление заказа в ROSAutoAsia. Выберите способ доставки и оплаты.",
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
