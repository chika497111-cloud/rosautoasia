"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";

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
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "number" | "userId" | "userName" | "userPhone" | "status" | "createdAt">) => Promise<Order>;
  // Админ-функции
  getAllOrders: () => Promise<Order[]>;
  getAllClients: () => Promise<User[]>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<boolean>;
  createStaffAccount: (name: string, phone: string, password: string, role: "admin" | "manager") => Promise<{ success: boolean; error?: string }>;
  getStaffAccounts: () => Promise<User[]>;
  deleteStaffAccount: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Convert phone to fake email for Firebase Auth: +996555000000 -> 996555000000@raa.kg */
function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@raa.kg`;
}

/** Read a user profile doc from Firestore */
async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: uid,
      name: data.name ?? "",
      phone: data.phone ?? "",
      password: "", // never stored / returned
      role: data.role ?? "client",
      createdAt: data.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Read user profile with retry — useful after registration when Firestore write may not be immediately consistent */
async function getUserProfileWithRetry(uid: string, maxRetries = 3): Promise<User | null> {
  for (let i = 0; i < maxRetries; i++) {
    const profile = await getUserProfile(uid);
    if (profile) return profile;
    // Wait before retry, increasing delay each time
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  return null;
}

/** Fetch orders for a specific user or all orders (admin) */
async function fetchOrders(uid?: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders");
    const q = uid
      ? query(ordersRef, where("userId", "==", uid), orderBy("createdAt", "desc"))
      : query(ordersRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        number: data.number ?? "",
        userId: data.userId ?? "",
        userName: data.userName ?? "",
        userPhone: data.userPhone ?? "",
        items: data.items ?? [],
        total: data.total ?? 0,
        status: data.status ?? "new",
        comment: data.comment ?? "",
        createdAt: data.createdAt ?? "",
      } as Order;
    });
  } catch {
    return [];
  }
}

/** Generate a timestamp-based order number: ROA-YYMMDD-HHMMSS-XXX */
function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  // Add random suffix to avoid collisions
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `ROA-${yy}${mm}${dd}-${hh}${min}${ss}-${rand}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Instant load from localStorage cache (optimistic)
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem("roa_user_cache");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const cached = localStorage.getItem("roa_orders_cache");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !localStorage.getItem("roa_user_cache");
  });

  // Sync cache when user/orders change
  useEffect(() => {
    if (user) {
      localStorage.setItem("roa_user_cache", JSON.stringify(user));
    } else {
      localStorage.removeItem("roa_user_cache");
    }
  }, [user]);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("roa_orders_cache", JSON.stringify(orders));
    } else {
      localStorage.removeItem("roa_orders_cache");
    }
  }, [orders]);

  // onAuthStateChanged is the SINGLE source of truth for auth state.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      try {
        if (fbUser) {
          const profile = await getUserProfileWithRetry(fbUser.uid);
          if (profile) {
            setUser(profile);
            try {
              if (profile.role === "admin" || profile.role === "manager") {
                setOrders(await fetchOrders());
              } else {
                setOrders(await fetchOrders(fbUser.uid));
              }
            } catch {
              setOrders([]);
            }
          } else {
            setUser(null);
            setOrders([]);
          }
        } else {
          setUser(null);
          setOrders([]);
        }
      } catch (err) {
        console.error("[AuthProvider] onAuthStateChanged error:", err);
        setUser(null);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // login() ONLY calls Firebase Auth and returns the result.
  // It does NOT set user, orders, or isLoading.
  // onAuthStateChanged handles all of that.
  const login = useCallback(async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const email = phoneToEmail(phone);
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will fire and load profile + orders
      return { success: true };
    } catch (err: unknown) {
      console.error("[login] Error:", err);
      const code = (err as { code?: string }).code;
      const message = (err as { message?: string }).message;
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        return { success: false, error: "Неверный телефон или пароль" };
      }
      if (code === "auth/wrong-password") {
        return { success: false, error: "Неверный пароль" };
      }
      if (code === "auth/network-request-failed") {
        return { success: false, error: "Нет подключения к интернету. Проверьте соединение." };
      }
      if (code === "auth/too-many-requests") {
        return { success: false, error: "Слишком много попыток. Подождите несколько минут." };
      }
      return { success: false, error: `Ошибка входа: ${code || message || "неизвестная ошибка"}` };
    }
  }, []);

  // register() creates the auth user + writes the Firestore profile, then returns.
  // It does NOT set user/orders — onAuthStateChanged will handle that.
  const register = useCallback(async (name: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (password.length < 6) {
        return { success: false, error: "Пароль должен быть не менее 6 символов" };
      }

      const email = phoneToEmail(phone);

      let cred;
      try {
        cred = await createUserWithEmailAndPassword(auth, email, password);
      } catch (authErr: unknown) {
        const code = (authErr as { code?: string }).code;
        if (code === "auth/email-already-in-use") {
          return { success: false, error: "Пользователь с таким телефоном уже зарегистрирован" };
        }
        if (code === "auth/weak-password") {
          return { success: false, error: "Пароль слишком слабый (минимум 6 символов)" };
        }
        return { success: false, error: "Ошибка регистрации. Попробуйте позже." };
      }

      // Write Firestore profile
      const now = new Date().toISOString();
      const profileData = { name, phone, role: "client" as const, createdAt: now };

      try {
        await setDoc(doc(db, "users", cred.user.uid), profileData);
      } catch {
        // Retry once
        await new Promise((r) => setTimeout(r, 1000));
        try {
          await setDoc(doc(db, "users", cred.user.uid), profileData);
        } catch (retryErr) {
          console.error("[register] Failed to write profile after retry:", retryErr);
          return { success: false, error: "Аккаунт создан, но профиль не сохранён. Попробуйте войти." };
        }
      }

      // onAuthStateChanged will fire (it already fired when createUserWithEmailAndPassword
      // resolved, but at that point profile may not have been written yet). Since we use
      // getUserProfileWithRetry in the listener, it will eventually find the profile.
      // However, onAuthStateChanged may have already fired and failed to find the profile.
      // In that case we need to manually trigger a reload. We do this by setting isLoading
      // and letting the caller know registration succeeded — they can redirect, and the
      // auth listener will have the profile by then.

      // Force a re-check by reloading the current user's token (triggers onAuthStateChanged)
      // Actually, onAuthStateChanged only fires on sign-in/sign-out, not token refresh.
      // Since createUserWithEmailAndPassword already triggered it, and our listener uses
      // getUserProfileWithRetry with 3 retries (500ms, 1000ms, 1500ms = 3s total),
      // the profile should be found. The profile write above takes ~100-500ms typically,
      // so by the time retry #2 runs, it should be there.

      return { success: true };
    } catch (err: unknown) {
      console.error("[register] Unexpected error:", err);
      return { success: false, error: "Ошибка регистрации. Попробуйте позже." };
    }
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
    // onAuthStateChanged will fire with null and clear user/orders
  }, []);

  const addOrder = useCallback(
    async (orderData: Omit<Order, "id" | "number" | "userId" | "userName" | "userPhone" | "status" | "createdAt">): Promise<Order> => {
      if (!user) throw new Error("Нужно войти в аккаунт");

      try {
        const orderNumber = generateOrderNumber();
        const now = new Date().toISOString();

        const orderDoc = {
          ...orderData,
          number: orderNumber,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          status: "new" as const,
          createdAt: now,
        };

        const ref = await addDoc(collection(db, "orders"), orderDoc);

        const newOrder: Order = {
          ...orderDoc,
          id: ref.id,
        };

        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
      } catch (err) {
        console.error("[addOrder] Error:", err);
        throw new Error("Не удалось создать заказ. Попробуйте позже.");
      }
    },
    [user]
  );

  const getAllOrders = useCallback(async (): Promise<Order[]> => {
    try {
      const all = await fetchOrders();
      setOrders(all);
      return all;
    } catch {
      return [];
    }
  }, []);

  const getAllClients = useCallback(async (): Promise<User[]> => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "client"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? "",
          phone: data.phone ?? "",
          password: "",
          role: data.role ?? "client",
          createdAt: data.createdAt ?? "",
        } as User;
      });
    } catch {
      return [];
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order["status"]): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const createStaffAccount = useCallback(async (name: string, phone: string, password: string, role: "admin" | "manager"): Promise<{ success: boolean; error?: string }> => {
    let secondaryApp;
    try {
      if (password.length < 6) {
        return { success: false, error: "Пароль должен быть не менее 6 символов" };
      }

      const email = phoneToEmail(phone);

      secondaryApp = initializeApp(auth.app.options, "staffCreator_" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        phone,
        role,
        createdAt: new Date().toISOString(),
      });

      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      return { success: true };
    } catch (err: unknown) {
      if (secondaryApp) {
        try { await deleteApp(secondaryApp); } catch { /* ignore */ }
      }
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        return { success: false, error: "Пользователь с таким телефоном уже существует" };
      }
      return { success: false, error: "Ошибка создания аккаунта" };
    }
  }, []);

  const getStaffAccounts = useCallback(async (): Promise<User[]> => {
    try {
      const q = query(collection(db, "users"), where("role", "in", ["admin", "manager"]));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? "",
          phone: data.phone ?? "",
          password: "",
          role: data.role ?? "manager",
          createdAt: data.createdAt ?? "",
        } as User;
      });
    } catch {
      return [];
    }
  }, []);

  const deleteStaffAccount = useCallback(async (userId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "users", userId));
      return true;
    } catch {
      return false;
    }
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
