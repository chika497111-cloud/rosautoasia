"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statusLabels: Record<string, { text: string; color: string }> = {
  new: { text: "Новый", color: "bg-blue-100 text-blue-700" },
  confirmed: { text: "Подтверждён", color: "bg-primary-container/20 text-primary" },
  ready: { text: "Готов к выдаче", color: "bg-green-100 text-green-700" },
  completed: { text: "Выполнен", color: "bg-surface-mid text-on-surface-variant" },
  cancelled: { text: "Отменён", color: "bg-red-100 text-red-700" },
};

export default function AccountPage() {
  const { user, isLoading, logout, orders } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Личный кабинет</h1>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="text-sm text-on-surface-variant hover:text-red-500 transition-colors"
        >
          Выйти
        </button>
      </div>

      {/* Информация о пользователе */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-on-surface mb-4">Мои данные</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-on-surface-variant">Имя</span>
            <p className="font-medium text-on-surface">{user.name}</p>
          </div>
          <div>
            <span className="text-sm text-on-surface-variant">Телефон</span>
            <p className="font-medium text-on-surface">{user.phone}</p>
          </div>
          <div>
            <span className="text-sm text-on-surface-variant">Дата регистрации</span>
            <p className="font-medium text-on-surface">
              {new Date(user.createdAt).toLocaleDateString("ru-RU")}
            </p>
          </div>
          <div>
            <span className="text-sm text-on-surface-variant">Всего заказов</span>
            <p className="font-medium text-on-surface">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* История заказов */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6">
        <h3 className="font-bold text-on-surface mb-4">История заказов</h3>

        {sortedOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-on-surface-variant mb-3">Заказов пока нет</p>
            <Link
              href="/catalog"
              className="text-primary hover:text-primary font-medium text-sm"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
              const status = statusLabels[order.status] || statusLabels.new;
              return (
                <div key={order.id} className="border border-outline-variant/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-on-surface">{order.number}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <span className="text-sm text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString("ru-RU")},{" "}
                      {new Date(order.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="divide-y divide-outline-variant/15">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-1.5 text-sm">
                        <span className="text-on-surface-variant">
                          {item.name} <span className="text-outline">x{item.quantity}</span>
                        </span>
                        <span className="text-on-surface font-medium">
                          {(item.price * item.quantity).toLocaleString("ru-RU")} сом
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-outline-variant/30 mt-2 pt-2 flex justify-between">
                    <span className="font-medium text-on-surface-variant">Итого</span>
                    <span className="font-bold text-on-surface">
                      {order.total.toLocaleString("ru-RU")} сом
                    </span>
                  </div>

                  {order.comment && (
                    <div className="mt-2 text-sm text-on-surface-variant">
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
  );
}
