import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Панель администратора",
  description: "Панель администратора ROSAutoAsia. Управление заказами, клиентами и сотрудниками.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
