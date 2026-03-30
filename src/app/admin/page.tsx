"use client";

import { useState, useEffect } from "react";
import { useAuth, type Order, type User } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { validatePhone, formatPhoneInput } from "@/lib/phone-utils";

const statusLabels: Record<string, { text: string; color: string }> = {
  new: { text: "Открыт", color: "bg-primary-fixed text-on-primary-fixed-variant" },
  confirmed: { text: "В работе", color: "bg-secondary-container/30 text-secondary" },
  ready: { text: "В работе", color: "bg-primary-container/20 text-primary" },
  completed: { text: "Выполнен", color: "bg-surface-high text-on-surface-variant" },
  cancelled: { text: "Отменён", color: "bg-error-container text-on-error-container" },
};

const statusOptions: { value: Order["status"]; label: string }[] = [
  { value: "new", label: "Открыт" },
  { value: "confirmed", label: "В работе" },
  { value: "completed", label: "Выполнен" },
  { value: "cancelled", label: "Отменён" },
];

type Tab = "orders" | "clients" | "staff";

export default function AdminPage() {
  const {
    user, isLoading, logout,
    getAllOrders, getAllClients, updateOrderStatus,
    createStaffAccount, getStaffAccounts, deleteStaffAccount,
    createClientAccount,
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

  // Форма создания клиента
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientPhone, setClientPhone] = useState("+996");
  const [clientCity, setClientCity] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientError, setClientError] = useState("");
  const [clientPhoneError, setClientPhoneError] = useState("");

  // Фильтр заказов
  const [orderFilter, setOrderFilter] = useState<string>("all");

  useEffect(() => {
    if (!isLoading && user && (user.role === "admin" || user.role === "manager")) {
      getAllOrders().then(setAllOrders);
      getAllClients().then(setClients);
      getStaffAccounts().then(setStaff);
    }
  }, [isLoading, user, getAllOrders, getAllClients, getStaffAccounts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant">Загрузка...</p>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    router.push("/login");
    return null;
  }

  const isAdmin = user.role === "admin";

  const filteredOrders = orderFilter === "all"
    ? allOrders
    : allOrders.filter((o) => o.status === orderFilter);

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    await updateOrderStatus(orderId, newStatus);
    setAllOrders(await getAllOrders());
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");

    const phoneCheck = validatePhone(staffPhone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "");
      return;
    }

    const result = await createStaffAccount(staffName.trim(), staffPhone.trim(), staffPassword, staffRole);
    if (result.success) {
      setStaff(await getStaffAccounts());
      setShowStaffForm(false);
      setStaffName("");
      setStaffPhone("+996");
      setStaffPassword("");
      setStaffRole("manager");
    } else {
      setStaffError(result.error || "Ошибка");
    }
  };

  const handleDeleteStaff = async (userId: string) => {
    if (await deleteStaffAccount(userId)) {
      setStaff(await getStaffAccounts());
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

  const handleClientPhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    setClientPhone(formatted);
    if (formatted.length > 4) {
      const result = validatePhone(formatted);
      setClientPhoneError(result.valid ? "" : result.error || "");
    } else {
      setClientPhoneError("");
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");

    if (!/^[\p{L}\s-]+$/u.test(clientFirstName.trim())) {
      setClientError("Имя должно содержать только буквы");
      return;
    }
    if (!/^[\p{L}\s-]+$/u.test(clientLastName.trim())) {
      setClientError("Фамилия должна содержать только буквы");
      return;
    }

    const phoneCheck = validatePhone(clientPhone);
    if (!phoneCheck.valid) {
      setClientPhoneError(phoneCheck.error || "");
      return;
    }

    if (clientCity && !/^[\p{L}\s-]+$/u.test(clientCity.trim())) {
      setClientError("Город должен содержать только буквы");
      return;
    }

    const result = await createClientAccount(
      clientFirstName.trim(),
      clientLastName.trim(),
      clientPhone.trim(),
      clientCity.trim(),
      clientAddress.trim(),
    );
    if (result.success) {
      setClients(await getAllClients());
      setShowClientForm(false);
      setClientFirstName("");
      setClientLastName("");
      setClientPhone("+996");
      setClientCity("");
      setClientAddress("");
    } else {
      setClientError(result.error || "Ошибка");
    }
  };

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "orders", label: `Заказы (${allOrders.length})`, show: true },
    { id: "clients", label: `Клиенты (${clients.length})`, show: true },
    { id: "staff", label: `Сотрудники (${staff.length})`, show: isAdmin },
  ];

  // Stats
  const newOrders = allOrders.filter((o) => o.status === "new").length;
  const confirmedOrders = allOrders.filter((o) => o.status === "confirmed").length;
  const totalRevenue = allOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-headline)] font-bold text-3xl text-[#451A03] tracking-tight">
              Панель администратора
            </h1>
            <p className="text-on-surface-variant mt-1">
              {user.name} — {isAdmin ? "Администратор" : "Менеджер"}
            </p>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="text-sm text-on-surface-variant font-medium hover:text-error transition-colors px-4 py-2 rounded-full border border-outline-variant hover:border-error/30"
          >
            Выйти
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface-lowest rounded-xl warm-shadow p-5">
            <div className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Новые заказы</div>
            <div className="text-3xl font-bold text-primary">{newOrders}</div>
          </div>
          <div className="bg-surface-lowest rounded-xl warm-shadow p-5">
            <div className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2">В обработке</div>
            <div className="text-3xl font-bold text-secondary">{confirmedOrders}</div>
          </div>
          <div className="bg-surface-lowest rounded-xl warm-shadow p-5">
            <div className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Выручка</div>
            <div className="text-3xl font-bold text-[#451A03]">{totalRevenue.toLocaleString("ru-RU")} сом</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-outline-variant/30">
          {tabs.filter((t) => t.show).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-primary-container text-[#451A03]"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* === ORDERS === */}
        {tab === "orders" && (
          <div>
            {/* Status filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setOrderFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  orderFilter === "all"
                    ? "cta-gradient text-white shadow-lg shadow-primary/20"
                    : "bg-surface-mid text-on-surface-variant hover:bg-surface-high"
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
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      orderFilter === s.value
                        ? "cta-gradient text-white shadow-lg shadow-primary/20"
                        : "bg-surface-mid text-on-surface-variant hover:bg-surface-high"
                    }`}
                  >
                    {s.label} ({count})
                  </button>
                );
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-mid rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-on-surface-variant">Заказов нет</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const status = statusLabels[order.status] || statusLabels.new;
                  return (
                    <div key={order.id} className="bg-surface-lowest rounded-xl warm-shadow p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-[#451A03] text-lg">{order.number}</span>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                          <div className="text-sm text-on-surface-variant">
                            {order.userName} — {order.userPhone}
                          </div>
                          <div className="text-xs text-outline mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("ru-RU")},{" "}
                            {new Date(order.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>

                        {isAdmin && (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                            className="bg-surface-mid rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                          >
                            {statusOptions.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="divide-y divide-outline-variant/20">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between py-2 text-sm">
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

                      <div className="border-t border-outline-variant/30 mt-2 pt-3 flex justify-between">
                        <span className="font-bold text-on-surface">Итого</span>
                        <span className="font-bold text-[#451A03] text-lg">{order.total.toLocaleString("ru-RU")} сом</span>
                      </div>

                      {order.comment && (
                        <div className="mt-3 text-sm text-on-surface-variant bg-surface-low rounded-lg px-4 py-2.5">
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

        {/* === CLIENTS === */}
        {tab === "clients" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-[family-name:var(--font-headline)] font-bold text-lg text-[#451A03]">
                Клиенты
              </h3>
              <button
                onClick={() => setShowClientForm(!showClientForm)}
                className="cta-gradient text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                + Добавить клиента
              </button>
            </div>

            {/* Client creation form */}
            {showClientForm && (
              <form onSubmit={handleCreateClient} className="bg-surface-lowest rounded-xl warm-shadow p-6 mb-6 space-y-4">
                {clientError && (
                  <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">{clientError}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Имя</label>
                    <input
                      type="text"
                      required
                      value={clientFirstName}
                      onChange={(e) => setClientFirstName(e.target.value)}
                      placeholder="Имя"
                      className="w-full px-4 py-3 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Фамилия</label>
                    <input
                      type="text"
                      required
                      value={clientLastName}
                      onChange={(e) => setClientLastName(e.target.value)}
                      placeholder="Фамилия"
                      className="w-full px-4 py-3 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Телефон</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => handleClientPhoneChange(e.target.value)}
                      placeholder="+996 555 123 456"
                      className={`w-full px-4 py-3 bg-surface-mid rounded-lg border-none focus:ring-2 text-on-surface placeholder:text-outline/50 transition-all ${
                        clientPhoneError ? "ring-2 ring-error/40" : "focus:ring-primary/20"
                      }`}
                    />
                    {clientPhoneError && <p className="text-error text-xs mt-1 ml-1">{clientPhoneError}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Город</label>
                    <input
                      type="text"
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      placeholder="Бишкек"
                      className="w-full px-4 py-3 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Адрес</label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="ул. Советская, 123"
                      className="w-full px-4 py-3 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="cta-gradient text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Создать
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClientForm(false)}
                    className="border border-outline-variant text-on-surface-variant font-medium px-6 py-2.5 rounded-full text-sm hover:bg-surface-low transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}

            {clients.length === 0 && !showClientForm ? (
              <div className="text-center py-16">
                <p className="text-on-surface-variant">Клиентов пока нет</p>
              </div>
            ) : clients.length > 0 && (
              <div className="bg-surface-lowest rounded-xl warm-shadow overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead className="bg-surface-mid">
                    <tr>
                      <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">ФИО</th>
                      <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Телефон</th>
                      <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Город</th>
                      <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Адрес</th>
                      <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Дата регистрации</th>
                      <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Заказов</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {clients.map((client) => {
                      const clientOrders = allOrders.filter((o) => o.userId === client.id);
                      const fullName = [client.firstName, client.lastName].filter(Boolean).join(" ") || client.name;
                      return (
                        <tr key={client.id} className="hover:bg-surface-low transition-colors">
                          <td className="px-5 py-4 font-medium text-on-surface">{fullName}</td>
                          <td className="px-5 py-4 text-on-surface-variant">{client.phone}</td>
                          <td className="px-5 py-4 text-on-surface-variant">{client.city || "---"}</td>
                          <td className="px-5 py-4 text-on-surface-variant">{client.address || "---"}</td>
                          <td className="px-5 py-4 text-on-surface-variant">
                            {new Date(client.createdAt).toLocaleDateString("ru-RU")}
                          </td>
                          <td className="px-5 py-4 text-on-surface-variant">{clientOrders.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* === STAFF === */}
        {tab === "staff" && isAdmin && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-[family-name:var(--font-headline)] font-bold text-lg text-[#451A03]">
                Сотрудники
              </h3>
              <button
                onClick={() => setShowStaffForm(!showStaffForm)}
                className="cta-gradient text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                + Добавить сотрудника
              </button>
            </div>

            {/* Staff form */}
            {showStaffForm && (
              <form onSubmit={handleCreateStaff} className="bg-surface-lowest rounded-xl warm-shadow p-6 mb-6 space-y-4">
                {staffError && (
                  <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">{staffError}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Имя</label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="Имя сотрудника"
                      className="w-full px-4 py-3 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Телефон</label>
                    <input
                      type="tel"
                      required
                      value={staffPhone}
                      onChange={(e) => handleStaffPhoneChange(e.target.value)}
                      placeholder="+996 555 123 456"
                      className={`w-full px-4 py-3 bg-surface-mid rounded-lg border-none focus:ring-2 text-on-surface placeholder:text-outline/50 transition-all ${
                        phoneError ? "ring-2 ring-error/40" : "focus:ring-primary/20"
                      }`}
                    />
                    {phoneError && <p className="text-error text-xs mt-1 ml-1">{phoneError}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Пароль</label>
                    <input
                      type="password"
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
                      className="w-full px-4 py-3 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Роль</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as "admin" | "manager")}
                      className="w-full px-4 py-3 bg-surface-mid rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-on-surface transition-all"
                    >
                      <option value="manager">Менеджер (только просмотр)</option>
                      <option value="admin">Администратор (полный доступ)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="cta-gradient text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Создать
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStaffForm(false)}
                    className="border border-outline-variant text-on-surface-variant font-medium px-6 py-2.5 rounded-full text-sm hover:bg-surface-low transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}

            {/* Staff list */}
            <div className="bg-surface-lowest rounded-xl warm-shadow overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-surface-mid">
                  <tr>
                    <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Имя</th>
                    <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Телефон</th>
                    <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Роль</th>
                    <th className="text-left px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Дата создания</th>
                    <th className="text-right px-5 py-4 font-semibold text-on-surface-variant uppercase tracking-wider text-xs">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-low transition-colors">
                      <td className="px-5 py-4 font-medium text-on-surface">{s.name}</td>
                      <td className="px-5 py-4 text-on-surface-variant">{s.phone}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          s.role === "admin"
                            ? "bg-primary-container/20 text-primary"
                            : "bg-secondary-container/30 text-secondary"
                        }`}>
                          {s.role === "admin" ? "Администратор" : "Менеджер"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {new Date(s.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {s.id !== "admin_root" ? (
                          <button
                            onClick={() => handleDeleteStaff(s.id)}
                            className="text-error hover:text-on-error-container text-xs font-semibold hover:underline underline-offset-4"
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
    </div>
  );
}
