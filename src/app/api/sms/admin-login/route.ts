import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "Телефон и пароль обязательны" }, { status: 400 });
    }

    // Check password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
    }

    const digits = phone.replace(/\D/g, "");
    const db = getAdminFirestore();
    const adminAuth = getAdminAuth();

    // Find user by phone
    const phonesToSearch = [`+${digits}`, digits, phone];
    let userId: string | null = null;
    let userRole: string | null = null;

    for (const p of phonesToSearch) {
      const snap = await db.collection("users").where("phone", "==", p).limit(1).get();
      if (!snap.empty) {
        userId = snap.docs[0].id;
        userRole = snap.docs[0].data().role;
        break;
      }
    }

    // Only allow admin/manager roles
    if (!userId || !userRole || !["admin", "manager"].includes(userRole)) {
      return NextResponse.json({ error: "Доступ запрещён. Только для администраторов." }, { status: 403 });
    }

    const token = await adminAuth.createCustomToken(userId);
    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error("[Admin Login] Error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
