"use client";

import { useState, useEffect } from "react";
import { useAuth, type Order, type User } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { validatePhone, formatPhoneInput } from "@/lib/phone-utils";

const statusLabels: Record<string, { text: string; color: string }> = {
  new: { text: "Новый", color: "bg-blue-100 text-blue-700" },
  confirmed: { text: "Подтверждён", color: "bg-primary-container/20 text-primary" },
  ready: { text: "Готов к выдаче", color: "bg-green-100 text-green-700" },
  completed: { text: "Выполнен", color: "bg-surface-mid text-on-surface-variant" },
  cancelled: { text: "Отменён", color: "bg-red-100 text-red-700" },
};

const statusOptions: { value: Order["status"]; label: string }[] = [
  { value: "new", label: "Новый" },
  { value: "confirmed", label: "Подтверждён" },
  { value: "ready", label: "Готов к выдаче" },
  { value: "completed", label: "Выполнен" },
  { value: "cancelled", label: "Отменён" },
];

type Tab = "orders" | "clients" | "staff";

export default function AdminPage() {
  const {
    user, isLoading, logout,
    getAllOrders, getAllClients, updateOrderStatus,
    createStaffAccount, getStaffAccounts, deleteStaffAccount,
  } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);

  // Форма создания сотрудника
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("+996");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState<"admin" | "manager">("manager");
  const [staffError, setStaffError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Фильтр заказов
  const [orderFilter, setOrderFilter] = useState<string>("all");

  useEffect(() => {
    if (!isLoading && user && (user.role === "admin" || user.role === "manager")) {
      setAllOrders(getAllOrders());
      setClients(getAllClients());
      setStaff(getStaffAccounts());
    }
  }, [isLoading, user, getAllOrders, getAllClients, getStaffAccounts]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-on-surface-variant">Загрузка...</div>;
  }

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    router.push("/login");
    return null;
  }

  const isAdmin = user.role === "admin";

  const filteredOrders = orderFilter === "all"
    ? allOrders
    : allOrders.filter((o) => o.status === orderFilter);

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus);
    setAllOrders(getAllOrders());
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");

    const phoneCheck = validatePhone(staffPhone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "");
      return;
    }

    const result = createStaffAccount(staffName.trim(), staffPhone.trim(), staffPassword, staffRole);
    if (result.success) {
      setStaff(getStaffAccounts());
      setShowStaffForm(false);
      setStaffName("");
      setStaffPhone("+996");
      setStaffPassword("");
      setStaffRole("manager");
    } else {
      setStaffError(result.error || "Ошибка");
    }
  };

  const handleDeleteStaff = (userId: string) => {
    if (deleteStaffAccount(userId)) {
      setStaff(getStaffAccounts());
    }
  };

  const handleStaffPhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    setStaffPhone(formatted);
    if (formatted.length > 4) {
      const result = validatePhone(formatted);
      setPhoneError(result.valid ? "" : result.error || "");
    } else {
      setPhoneError("");
    }
  };

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "orders", label: `Заказы (${allOrders.length})`, show: true },
    { id: "clients", label: `Клиенты (${clients.length})`, show: true },
    { id: "staff", label: `Сотрудники (${staff.length})`, show: isAdmin },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Админ-панель</h1>
          <p className="text-sm text-on-surface-variant">
            {user.name} — {isAdmin ? "Администратор" : "Менеджер"}
          </p>
        </div>
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="text-sm text-on-surface-variant hover:text-red-500 transition-colors"
        >
          Выйти
        </button>
      </div>

      {/* Табы */}
      <div className="flex gap-1 mb-6 border-b border-outline-variant/30">
        {tabs.filter((t) => t.show).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-primary-container text-on-surface"
                : "border-transparent text-on-surface-variant hover:text-on-surface-variant"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* === ЗАКАЗЫ === */}
      {tab === "orders" && (
        <div>
          {/* Фильтр по статусу */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setOrderFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                orderFilter === "all" ? "bg-[#451A03] text-white" : "bg-surface-mid text-on-surface-variant hover:bg-surface-high"
              }`}
            >
              Все ({allOrders.length})
            </button>
            {statusOptions.map((s) => {
              const count = allOrders.filter((o) => o.status === s.value).length;
              return (
                <button
                  key={s.value}
                  onClick={() => setOrderFilter(s.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    orderFilter === s.value ? "bg-[#451A03] text-white" : "bg-surface-mid text-on-surface-variant hover:bg-surface-high"
                  }`}
                >
                  {s.label} ({count})
                </button>
              );
            })}
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-on-surface-variant text-center py-12">Заказов нет</p>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const status = statusLabels[order.status] || statusLabels.new;
                return (
                  <div key={order.id} className="bg-white border border-outline-variant/30 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-on-surface text-lg">{order.number}</span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <div className="text-sm text-on-surface-variant">
                          {order.userName} — {order.userPhone}
                        </div>
                        <div className="text-xs text-outline">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")},{" "}
                          {new Date(order.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      {/* Смена статуса — только для админа */}
                      {isAdmin && (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                          className="border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Товары */}
                    <div className="divide-y divide-outline-variant/15">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between py-1.5 text-sm">
                          <span className="text-on-surface-variant">
                            {item.name} <span className="text-outline">({item.article})</span>{" "}
                            <span className="text-outline">x{item.quantity}</span>
                          </span>
                          <span className="font-medium text-on-surface">
                            {(item.price * item.quantity).toLocaleString("ru-RU")} сом
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-outline-variant/30 mt-2 pt-2 flex justify-between">
                      <span className="font-bold text-on-surface">Итого</span>
                      <span className="font-bold text-on-surface">{order.total.toLocaleString("ru-RU")} сом</span>
                    </div>

                    {order.comment && (
                      <div className="mt-2 text-sm text-on-surface-variant bg-surface-low rounded-lg px-3 py-2">
                        {order.comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === КЛИЕНТЫ === */}
      {tab === "clients" && (
        <div>
          {clients.length === 0 ? (
            <p className="text-on-surface-variant text-center py-12">Клиентов пока нет</p>
          ) : (
            <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-low border-b border-outline-variant/30">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Имя</th>
                    <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Телефон</th>
                    <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Дата регистрации</th>
                    <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Заказов</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {clients.map((client) => {
                    const clientOrders = allOrders.filter((o) => o.userId === client.id);
                    return (
                      <tr key={client.id} className="hover:bg-surface-low">
                        <td className="px-4 py-3 font-medium text-on-surface">{client.name}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{client.phone}</td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {new Date(client.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{clientOrders.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* === СОТРУДНИКИ (только для админа) === */}
      {tab === "staff" && isAdmin && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface">Сотрудники</h3>
            <button
              onClick={() => setShowStaffForm(!showStaffForm)}
              className="bg-primary-container text-on-surface font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary-container/80 transition-colors"
            >
              + Добавить сотрудника
            </button>
          </div>

          {/* Форма добавления */}
          {showStaffForm && (
            <form onSubmit={handleCreateStaff} className="bg-white border border-outline-variant/30 rounded-xl p-5 mb-4 space-y-3">
              {staffError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{staffError}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Имя</label>
                  <input
                    type="text"
                    required
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Имя сотрудника"
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Телефон</label>
                  <input
                    type="tel"
                    required
                    value={staffPhone}
                    onChange={(e) => handleStaffPhoneChange(e.target.value)}
                    placeholder="+996 555 123 456"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      phoneError ? "border-red-400 focus:ring-red-400" : "border-outline-variant focus:ring-primary-container/40"
                    }`}
                  />
                  {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Пароль</label>
                  <input
                    type="password"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Минимум 4 символа"
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Роль</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as "admin" | "manager")}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40"
                  >
                    <option value="manager">Менеджер (только просмотр)</option>
                    <option value="admin">Администратор (полный доступ)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary-container text-on-surface font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary-container/80 transition-colors"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowStaffForm(false)}
                  className="border border-outline-variant text-on-surface-variant px-4 py-2 rounded-lg text-sm hover:bg-surface-low transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          {/* Список сотрудников */}
          <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-low border-b border-outline-variant/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Имя</th>
                  <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Телефон</th>
                  <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Роль</th>
                  <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Дата создания</th>
                  <th className="text-right px-4 py-3 font-medium text-on-surface-variant">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-low">
                    <td className="px-4 py-3 font-medium text-on-surface">{s.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{s.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        s.role === "admin" ? "bg-primary-container/20 text-primary" : "bg-blue-100 text-blue-700"
                      }`}>
                        {s.role === "admin" ? "Администратор" : "Менеджер"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(s.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.id !== "admin_root" ? (
                        <button
                          onClick={() => handleDeleteStaff(s.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Удалить
                        </button>
                      ) : (
                        <span className="text-xs text-outline">Главный</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
