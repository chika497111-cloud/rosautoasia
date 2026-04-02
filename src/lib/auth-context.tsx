"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithCustomToken,
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
  limit as firestoreLimit,
} from "firebase/firestore";

export type UserRole = "client" | "admin" | "manager";

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  city?: string;
  address?: string;
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
  status: "new" | "confirmed" | "completed" | "cancelled";
  comment: string;
  deliveryMethod?: "pickup" | "courier" | "regional";
  paymentMethod?: "cash" | "elsom" | "card";
  deliveryAddress?: string;
  city?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "number" | "userId" | "userName" | "userPhone" | "status" | "createdAt">) => Promise<Order>;
  getAllOrders: () => Promise<Order[]>;
  getAllClients: () => Promise<User[]>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<boolean>;
  createStaffAccount: (name: string, phone: string, role: "admin" | "manager") => Promise<{ success: boolean; error?: string }>;
  getStaffAccounts: () => Promise<User[]>;
  deleteStaffAccount: (userId: string) => Promise<boolean>;
  updateProfile: (data: { firstName?: string; lastName?: string; city?: string; address?: string }) => Promise<boolean>;
  createClientAccount: (firstName: string, lastName: string, phone: string, city?: string, address?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Read a user profile doc from Firestore */
async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: uid,
      name: data.name ?? "",
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      phone: data.phone ?? "",
      city: data.city ?? "",
      address: data.address ?? "",
      role: data.role ?? "client",
      createdAt: data.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Read user profile with retry */
async function getUserProfileWithRetry(uid: string, maxRetries = 3): Promise<User | null> {
  for (let i = 0; i < maxRetries; i++) {
    const profile = await getUserProfile(uid);
    if (profile) return profile;
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  return null;
}

/** Fetch orders for a specific user or all orders (admin) */
async function fetchOrders(uid?: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders");
    const q = uid
      ? query(ordersRef, where("userId", "==", uid), orderBy("createdAt", "desc"), firestoreLimit(100))
      : query(ordersRef, orderBy("createdAt", "desc"), firestoreLimit(200));
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
        deliveryMethod: data.deliveryMethod,
        paymentMethod: data.paymentMethod,
        deliveryAddress: data.deliveryAddress,
        city: data.city,
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
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `ROA-${yy}${mm}${dd}-${hh}${min}${ss}-${rand}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cached data from localStorage after mount (client only)
  useEffect(() => {
    try {
      const cachedUser = localStorage.getItem("roa_user_cache");
      if (cachedUser) setUser(JSON.parse(cachedUser));
      const cachedOrders = localStorage.getItem("roa_orders_cache");
      if (cachedOrders) setOrders(JSON.parse(cachedOrders));
    } catch { /* ignore */ }
  }, []);

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

  const loginWithToken = useCallback(async (token: string): Promise<void> => {
    await signInWithCustomToken(auth, token);
    // onAuthStateChanged will fire and load profile + orders
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
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
        const newOrder: Order = { ...orderDoc, id: ref.id };
        setOrders((prev) => [newOrder, ...prev]);

        // Send Telegram notification (fire and forget)
        import("@/lib/telegram").then(({ notifyNewOrder }) => {
          notifyNewOrder({
            number: orderNumber,
            userName: user.name,
            userPhone: user.phone,
            total: orderData.total,
            items: orderData.items,
            comment: orderData.comment,
            deliveryMethod: orderData.deliveryMethod,
            city: orderData.city,
          }).catch(() => {});
        });

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
      const q = query(collection(db, "users"), where("role", "==", "client"), firestoreLimit(500));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? "",
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phone: data.phone ?? "",
          city: data.city ?? "",
          address: data.address ?? "",
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

  const createStaffAccount = useCallback(async (name: string, phone: string, role: "admin" | "manager"): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create staff via server API (admin SDK handles Firebase Auth)
      const res = await fetch("/api/sms/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Ошибка создания аккаунта" };
      return { success: true };
    } catch {
      return { success: false, error: "Ошибка создания аккаунта" };
    }
  }, []);

  const getStaffAccounts = useCallback(async (): Promise<User[]> => {
    try {
      const q = query(collection(db, "users"), where("role", "in", ["admin", "manager"]), firestoreLimit(50));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? "",
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phone: data.phone ?? "",
          city: data.city ?? "",
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

  const updateProfile = useCallback(async (data: { firstName?: string; lastName?: string; city?: string; address?: string }): Promise<boolean> => {
    if (!user) return false;
    try {
      const updates: Record<string, string> = {};
      if (data.firstName !== undefined) updates.firstName = data.firstName;
      if (data.lastName !== undefined) updates.lastName = data.lastName;
      if (data.city !== undefined) updates.city = data.city;
      if (data.address !== undefined) updates.address = data.address;
      if (data.firstName !== undefined || data.lastName !== undefined) {
        const fn = data.firstName ?? user.firstName ?? "";
        const ln = data.lastName ?? user.lastName ?? "";
        updates.name = [fn, ln].filter(Boolean).join(" ") || user.name;
      }
      await updateDoc(doc(db, "users", user.id), updates);
      setUser((prev) => prev ? { ...prev, ...updates } : prev);
      return true;
    } catch {
      return false;
    }
  }, [user]);

  const createClientAccount = useCallback(async (firstName: string, lastName: string, phone: string, city?: string, address?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/sms/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, city, address }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Ошибка создания клиента" };
      return { success: true };
    } catch {
      return { success: false, error: "Ошибка создания клиента" };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user, isLoading, loginWithToken, logout, orders, addOrder,
        getAllOrders, getAllClients, updateOrderStatus,
        createStaffAccount, getStaffAccounts, deleteStaffAccount,
        updateProfile, createClientAccount,
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
