import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "Личный кабинет ROSAutoAsia. История заказов, данные профиля.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
