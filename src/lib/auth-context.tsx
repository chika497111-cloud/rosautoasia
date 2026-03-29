"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
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

/** Fetch orders for a specific user or all orders (admin) */
async function fetchOrders(uid?: string): Promise<Order[]> {
  try {
    // All orders are stored in a top-level "orders" collection for admin access
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track whether register() already set the user so onAuthStateChanged can skip redundant work
  const justRegisteredRef = useRef(false);

  // Listen for Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      try {
        if (fbUser) {
          // If register() already set the user, skip the Firestore lookup
          // to avoid the race condition where the profile doesn't exist yet
          if (justRegisteredRef.current) {
            justRegisteredRef.current = false;
            setIsLoading(false);
            return;
          }

          let profile = await getUserProfile(fbUser.uid);
          if (!profile) {
            await new Promise((r) => setTimeout(r, 1500));
            profile = await getUserProfile(fbUser.uid);
          }
          if (profile) {
            setUser(profile);
            // Load orders
            try {
              if (profile.role === "admin" || profile.role === "manager") {
                setOrders(await fetchOrders());
              } else {
                setOrders(await fetchOrders(fbUser.uid));
              }
            } catch {
              // Orders query may fail (e.g. missing composite index) — not fatal
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
      } catch {
        // Prevent unhandled promise rejection from crashing the app
        setUser(null);
        setOrders([]);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const register = useCallback(async (name: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (password.length < 6) {
        return { success: false, error: "Пароль должен быть не менее 6 символов" };
      }

      const email = phoneToEmail(phone);

      // Mark that we're registering so onAuthStateChanged skips redundant Firestore lookup
      justRegisteredRef.current = true;

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Create Firestore profile
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        phone,
        role: "client",
        createdAt: new Date().toISOString(),
      });

      const profile: User = {
        id: cred.user.uid,
        name,
        phone,
        password: "",
        role: "client",
        createdAt: new Date().toISOString(),
      };

      setUser(profile);
      setOrders([]);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      // Reset the flag so onAuthStateChanged can process normally on next auth event
      justRegisteredRef.current = false;
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        return { success: false, error: "Пользователь с таким телефоном уже зарегистрирован" };
      }
      if (code === "auth/weak-password") {
        return { success: false, error: "Пароль слишком слабый (минимум 6 символов)" };
      }
      return { success: false, error: "Ошибка регистрации. Попробуйте позже." };
    }
  }, []);

  const login = useCallback(async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const email = phoneToEmail(phone);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(cred.user.uid);

      if (!profile) {
        return { success: false, error: "Профиль не найден" };
      }

      setUser(profile);

      if (profile.role === "admin" || profile.role === "manager") {
        setOrders(await fetchOrders());
      } else {
        setOrders(await fetchOrders(cred.user.uid));
      }

      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        return { success: false, error: "Неверный телефон или пароль" };
      }
      if (code === "auth/wrong-password") {
        return { success: false, error: "Неверный пароль" };
      }
      return { success: false, error: "Ошибка входа. Попробуйте позже." };
    }
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
    setUser(null);
    setOrders([]);
  }, []);

  const addOrder = useCallback(
    async (orderData: Omit<Order, "id" | "number" | "userId" | "userName" | "userPhone" | "status" | "createdAt">): Promise<Order> => {
      if (!user) throw new Error("Нужно войти в аккаунт");

      try {
        // Get next order number
        const allOrders = await fetchOrders();
        const orderNumber = "ROA-" + String(allOrders.length + 1).padStart(6, "0");
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
      } catch {
        throw new Error("Не удалось создать заказ. Попробуйте позже.");
      }
    },
    [user]
  );

  const getAllOrders = useCallback(async (): Promise<Order[]> => {
    const all = await fetchOrders();
    setOrders(all);
    return all;
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
    // Use a secondary Firebase app so the current admin session is not disrupted
    let secondaryApp;
    try {
      if (password.length < 6) {
        return { success: false, error: "Пароль должен быть не менее 6 символов" };
      }

      const email = phoneToEmail(phone);

      // Create a temporary secondary app to register the new user
      secondaryApp = initializeApp(auth.app.options, "staffCreator_" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        phone,
        role,
        createdAt: new Date().toISOString(),
      });

      // Sign out and clean up secondary app
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      return { success: true };
    } catch (err: unknown) {
      // Clean up secondary app on error
      if (secondaryApp) {
        try { await deleteApp(secondaryApp); } catch {}
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
      // We can only delete the Firestore doc from client side.
      // Deleting the Firebase Auth user requires Admin SDK (server-side).
      // For now, we remove the profile doc which effectively blocks access.
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
