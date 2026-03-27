import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Восстановление пароля",
  description: "Восстановление пароля от аккаунта ROSAutoAsia. Получите код подтверждения на телефон.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
