"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AccountSkeleton } from "@/components/Skeleton";

const statusLabels: Record<string, { text: string; color: string }> = {
  new: { text: "Открыт", color: "bg-primary-fixed text-on-primary-fixed-variant" },
  confirmed: { text: "В работе", color: "bg-secondary-container/30 text-secondary" },
  ready: { text: "В работе", color: "bg-primary-container/20 text-primary" },
  completed: { text: "Выполнен", color: "bg-surface-high text-on-surface-variant" },
  cancelled: { text: "Отменён", color: "bg-error-container text-on-error-container" },
};

export default function AccountPage() {
  const { user, isLoading, logout, orders, updateProfile } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (isLoading) {
    return <AccountSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-on-surface-variant">
          <a href="/login" className="text-primary font-bold hover:underline">Войдите</a> чтобы увидеть личный кабинет
        </div>
      </div>
    );
  }

  const startEditing = () => {
    setEditFirstName(user.firstName || "");
    setEditLastName(user.lastName || "");
    setEditCity(user.city || "");
    setEditAddress(user.address || "");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      city: editCity.trim(),
      address: editAddress.trim(),
    });
    setSaving(false);
    setEditing(false);
  };

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
        <div className="bg-surface-lowest rounded-xl warm-shadow p-6 md:p-8 mb-6 scroll-reveal">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-[family-name:var(--font-headline)] font-bold text-lg text-[#451A03]">
              Мои данные
            </h3>
            {!editing && (
              <button
                onClick={startEditing}
                className="text-sm text-primary font-semibold hover:underline underline-offset-4 transition-colors flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Редактировать профиль
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Имя</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="Имя"
                    className="w-full bg-surface-mid border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Фамилия</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Фамилия"
                    className="w-full bg-surface-mid border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Город</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Бишкек"
                    className="w-full bg-surface-mid border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Адрес</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="ул. Советская, 123"
                    className="w-full bg-surface-mid border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="cta-gradient text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="border border-outline-variant text-on-surface-variant font-medium px-6 py-2.5 rounded-full text-sm hover:bg-surface-low transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Имя</span>
                <p className="font-medium text-on-surface mt-1">{user.firstName || user.name || "---"}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Фамилия</span>
                <p className="font-medium text-on-surface mt-1">{user.lastName || "---"}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Телефон</span>
                <p className="font-medium text-on-surface mt-1">{user.phone}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Город</span>
                <p className="font-medium text-on-surface mt-1">{user.city || "---"}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Адрес</span>
                <p className="font-medium text-on-surface mt-1">{user.address || "---"}</p>
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
          )}
        </div>

        {/* Bonus card */}
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl warm-shadow p-6 md:p-8 mb-6 border border-amber-200/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-headline)] font-bold text-lg text-amber-900 mb-1">
                Бонусный баланс: 0 бонусов
              </h3>
              <p className="text-amber-800/80 text-sm font-medium">
                Бонусы начисляются после выполнения заказа
              </p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-surface-lowest rounded-xl warm-shadow p-6 md:p-8 scroll-reveal">
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
                const isExpanded = expandedOrder === order.id;
                const deliveryLabels: Record<string, string> = { pickup: "Самовывоз", courier: "Курьер", regional: "Доставка по регионам" };
                const paymentLabels: Record<string, string> = { cash: "Наличные", elsom: "Элсом", card: "Карта" };

                return (
                  <div key={order.id} className="bg-surface-low rounded-xl overflow-hidden transition-all hover:warm-shadow">
                    {/* Header — clickable */}
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full p-5 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-on-surface text-lg">{order.number}</span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                          {status.text}
                        </span>
                        <span className="text-sm text-on-surface-variant">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#451A03]">
                          {order.total.toLocaleString("ru-RU")} сом
                        </span>
                        <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                          expand_more
                        </span>
                      </div>
                    </button>

                    {/* Expandable details */}
                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-4">
                        {/* Order info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-on-surface-variant block text-xs uppercase tracking-wider">Дата</span>
                            <span className="font-medium text-on-surface">
                              {new Date(order.createdAt).toLocaleDateString("ru-RU")},{" "}
                              {new Date(order.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {order.deliveryMethod && (
                            <div>
                              <span className="text-on-surface-variant block text-xs uppercase tracking-wider">Доставка</span>
                              <span className="font-medium text-on-surface">{deliveryLabels[order.deliveryMethod] || order.deliveryMethod}</span>
                            </div>
                          )}
                          {order.paymentMethod && (
                            <div>
                              <span className="text-on-surface-variant block text-xs uppercase tracking-wider">Оплата</span>
                              <span className="font-medium text-on-surface">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
                            </div>
                          )}
                          {order.city && (
                            <div>
                              <span className="text-on-surface-variant block text-xs uppercase tracking-wider">Город</span>
                              <span className="font-medium text-on-surface">{order.city}</span>
                            </div>
                          )}
                        </div>

                        {order.deliveryAddress && (
                          <div className="text-sm">
                            <span className="text-on-surface-variant text-xs uppercase tracking-wider">Адрес доставки: </span>
                            <span className="text-on-surface">{order.deliveryAddress}</span>
                          </div>
                        )}

                        {/* Items */}
                        <div className="divide-y divide-outline-variant/20">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between py-2 text-sm">
                              <span className="text-on-surface-variant">
                                {item.name}{" "}
                                {item.article && <span className="text-outline text-xs">({item.article})</span>}{" "}
                                <span className="text-outline">x{item.quantity}</span>
                              </span>
                              <span className="text-on-surface font-medium whitespace-nowrap ml-4">
                                {(item.price * item.quantity).toLocaleString("ru-RU")} сом
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-outline-variant/30 pt-3 flex justify-between">
                          <span className="font-medium text-on-surface-variant">Итого</span>
                          <span className="font-bold text-[#451A03] text-lg">
                            {order.total.toLocaleString("ru-RU")} сом
                          </span>
                        </div>

                        {order.comment && (
                          <div className="text-sm text-on-surface-variant bg-surface-mid rounded-lg px-4 py-2.5">
                            💬 {order.comment}
                          </div>
                        )}

                        {/* 1C sync info */}
                        {order.status === "completed" && (
                          <div className="text-xs text-on-surface-variant bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Заказ выполнен и передан в 1С
                          </div>
                        )}
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
