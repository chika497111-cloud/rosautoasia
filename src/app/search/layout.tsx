import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Поиск запчастей",
  description:
    "Поиск автозапчастей в каталоге ROSAutoAsia. Введите название детали или артикул.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
