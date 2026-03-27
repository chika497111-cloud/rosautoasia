import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Подбор по автомобилю",
  description: "Подбор автозапчастей по марке и модели автомобиля в ROSAutoAsia. Toyota, Hyundai, Kia, Honda, Nissan, Mitsubishi и другие.",
  openGraph: {
    title: "Подбор запчастей по автомобилю — ROSAutoAsia",
    description: "Выберите марку и модель авто — мы подберём нужные запчасти.",
    url: "https://raa.kg/select-car",
  },
};

export default function SelectCarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
