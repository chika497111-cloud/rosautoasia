"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statusLabels: Record<string, { text: string; color: string }> = {
  new: { text: "Новый", color: "bg-primary-fixed text-on-primary-fixed-variant" },
  confirmed: { text: "Подтверждён", color: "bg-secondary-container/30 text-secondary" },
  ready: { text: "Готов к выдаче", color: "bg-primary-container/20 text-primary" },
  completed: { text: "Выполнен", color: "bg-surface-high text-on-surface-variant" },
  cancelled: { text: "Отменён", color: "bg-error-container text-on-error-container" },
};

export default function AccountPage() {
  const { user, isLoading, logout, orders } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[family-name:var(--font-headline)] font-bold text-3xl text-[#451A03] tracking-tight">
            Личный кабинет
          </h1>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-sm text-on-surface-variant font-medium hover:text-error transition-colors px-4 py-2 rounded-full border border-outline-variant hover:border-error/30"
          >
            Выйти
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-surface-lowest rounded-xl warm-shadow p-6 md:p-8 mb-6">
          <h3 className="font-[family-name:var(--font-headline)] font-bold text-lg text-[#451A03] mb-5">
            Мои данные
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Имя</span>
              <p className="font-medium text-on-surface mt-1">{user.name}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Телефон</span>
              <p className="font-medium text-on-surface mt-1">{user.phone}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Дата регистрации</span>
              <p className="font-medium text-on-surface mt-1">
                {new Date(user.createdAt).toLocaleDateString("ru-RU")}
              </p>
            </div>
            <div>
              <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Всего заказов</span>
              <p className="font-medium text-on-surface mt-1">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-surface-lowest rounded-xl warm-shadow p-6 md:p-8">
          <h3 className="font-[family-name:var(--font-headline)] font-bold text-lg text-[#451A03] mb-5">
            История заказов
          </h3>

          {sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-mid rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-on-surface-variant mb-4">Заказов пока нет</p>
              <Link
                href="/catalog"
                className="inline-block cta-gradient text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedOrders.map((order) => {
                const status = statusLabels[order.status] || statusLabels.new;
                return (
                  <div key={order.id} className="bg-surface-low rounded-xl p-5 transition-all hover:warm-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-on-surface text-lg">{order.number}</span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <span className="text-sm text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleDateString("ru-RU")},{" "}
                        {new Date(order.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="divide-y divide-outline-variant/20">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between py-2 text-sm">
                          <span className="text-on-surface-variant">
                            {item.name} <span className="text-outline">x{item.quantity}</span>
                          </span>
                          <span className="text-on-surface font-medium">
                            {(item.price * item.quantity).toLocaleString("ru-RU")} сом
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-outline-variant/30 mt-2 pt-3 flex justify-between">
                      <span className="font-medium text-on-surface-variant">Итого</span>
                      <span className="font-bold text-[#451A03] text-lg">
                        {order.total.toLocaleString("ru-RU")} сом
                      </span>
                    </div>

                    {order.comment && (
                      <div className="mt-3 text-sm text-on-surface-variant bg-surface-mid rounded-lg px-4 py-2.5">
                        Комментарий: {order.comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
