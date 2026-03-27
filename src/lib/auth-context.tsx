"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type UserRole = "client" | "admin" | "manager";

export interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface Order {
  id: string;
  number: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: { name: string; article: string; price: number; quantity: number }[];
  total: number;
  status: "new" | "confirmed" | "ready" | "completed" | "cancelled";
  comment: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string) => { success: boolean; error?: string };
  register: (name: string, phone: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "number" | "userId" | "userName" | "userPhone" | "status" | "createdAt">) => Order;
  // Админ-функции
  getAllOrders: () => Order[];
  getAllClients: () => User[];
  updateOrderStatus: (orderId: string, status: Order["status"]) => boolean;
  createStaffAccount: (name: string, phone: string, password: string, role: "admin" | "manager") => { success: boolean; error?: string };
  getStaffAccounts: () => User[];
  deleteStaffAccount: (userId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_DEFAULT_ID = "admin_root";
const ADMIN_DEFAULT_PHONE = "+996000000000";
const ADMIN_DEFAULT_PASSWORD = "admin123";
const ADMIN_DEFAULT_NAME = "Администратор";

function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("roa_users");
  const users: User[] = data ? JSON.parse(data) : [];

  // Обеспечить наличие главного админа
  if (!users.find((u) => u.id === ADMIN_DEFAULT_ID)) {
    const admin: User = {
      id: ADMIN_DEFAULT_ID,
      name: ADMIN_DEFAULT_NAME,
      phone: ADMIN_DEFAULT_PHONE,
      password: ADMIN_DEFAULT_PASSWORD,
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    users.push(admin);
    saveUsers(users);
  }

  // Миграция: если у пользователя нет роли — назначить client
  let needsSave = false;
  for (const u of users) {
    if (!u.role) {
      u.role = "client";
      needsSave = true;
    }
  }
  if (needsSave) saveUsers(users);

  return users;
}

function saveUsers(users: User[]) {
  localStorage.setItem("roa_users", JSON.stringify(users));
}

function getOrdersFromStorage(): Order[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("roa_orders");
  return data ? JSON.parse(data) : [];
}

function saveOrdersToStorage(orders: Order[]) {
  localStorage.setItem("roa_orders", JSON.stringify(orders));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem("roa_current_user");
    if (savedUserId) {
      const users = getUsers();
      const found = users.find((u) => u.id === savedUserId);
      if (found) {
        setUser(found);
        if (found.role === "admin" || found.role === "manager") {
          setOrders(getOrdersFromStorage());
        } else {
          setOrders(getOrdersFromStorage().filter((o) => o.userId === found.id));
        }
      }
    } else {
      // Всё равно вызываем getUsers чтобы создать админа
      getUsers();
    }
    setIsLoading(false);
  }, []);

  const register = useCallback((name: string, phone: string, password: string) => {
    const users = getUsers();
    const normalizedPhone = phone.replace(/\D/g, "");

    if (users.find((u) => u.phone.replace(/\D/g, "") === normalizedPhone)) {
      return { success: false, error: "Пользователь с таким телефоном уже зарегистрирован" };
    }

    if (password.length < 4) {
      return { success: false, error: "Пароль должен быть не менее 4 символов" };
    }

    const newUser: User = {
      id: "user_" + Date.now(),
      name,
      phone,
      password,
      role: "client",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    setUser(newUser);
    localStorage.setItem("roa_current_user", newUser.id);
    setOrders([]);

    return { success: true };
  }, []);

  const login = useCallback((phone: string, password: string) => {
    const users = getUsers();
    const normalizedPhone = phone.replace(/\D/g, "");
    const found = users.find((u) => u.phone.replace(/\D/g, "") === normalizedPhone);

    if (!found) {
      return { success: false, error: "Пользователь не найден" };
    }

    if (found.password !== password) {
      return { success: false, error: "Неверный пароль" };
    }

    setUser(found);
    localStorage.setItem("roa_current_user", found.id);

    if (found.role === "admin" || found.role === "manager") {
      setOrders(getOrdersFromStorage());
    } else {
      setOrders(getOrdersFromStorage().filter((o) => o.userId === found.id));
    }

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setOrders([]);
    localStorage.removeItem("roa_current_user");
  }, []);

  const addOrder = useCallback(
    (orderData: Omit<Order, "id" | "number" | "userId" | "userName" | "userPhone" | "status" | "createdAt">) => {
      if (!user) throw new Error("Нужно войти в аккаунт");

      const allOrders = getOrdersFromStorage();
      const newOrder: Order = {
        ...orderData,
        id: "order_" + Date.now(),
        number: "ROA-" + String(allOrders.length + 1).padStart(6, "0"),
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        status: "new",
        createdAt: new Date().toISOString(),
      };

      allOrders.push(newOrder);
      saveOrdersToStorage(allOrders);
      setOrders((prev) => [...prev, newOrder]);

      return newOrder;
    },
    [user]
  );

  const getAllOrders = useCallback(() => {
    return getOrdersFromStorage().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, []);

  const getAllClients = useCallback(() => {
    return getUsers().filter((u) => u.role === "client");
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    const allOrders = getOrdersFromStorage();
    const idx = allOrders.findIndex((o) => o.id === orderId);
    if (idx === -1) return false;

    allOrders[idx].status = status;
    saveOrdersToStorage(allOrders);
    setOrders(allOrders);
    return true;
  }, []);

  const createStaffAccount = useCallback((name: string, phone: string, password: string, role: "admin" | "manager") => {
    const users = getUsers();
    const normalizedPhone = phone.replace(/\D/g, "");

    if (users.find((u) => u.phone.replace(/\D/g, "") === normalizedPhone)) {
      return { success: false, error: "Пользователь с таким телефоном уже существует" };
    }

    if (password.length < 4) {
      return { success: false, error: "Пароль должен быть не менее 4 символов" };
    }

    const newUser: User = {
      id: "staff_" + Date.now(),
      name,
      phone,
      password,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    return { success: true };
  }, []);

  const getStaffAccounts = useCallback(() => {
    return getUsers().filter((u) => u.role === "admin" || u.role === "manager");
  }, []);

  const deleteStaffAccount = useCallback((userId: string) => {
    if (userId === ADMIN_DEFAULT_ID) return false; // нельзя удалить главного
    const users = getUsers().filter((u) => u.id !== userId);
    saveUsers(users);
    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user, isLoading, login, register, logout, orders, addOrder,
        getAllOrders, getAllClients, updateOrderStatus,
        createStaffAccount, getStaffAccounts, deleteStaffAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
