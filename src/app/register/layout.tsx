import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Регистрация в ROSAutoAsia. Создайте аккаунт для оформления заказов и отслеживания доставки.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
