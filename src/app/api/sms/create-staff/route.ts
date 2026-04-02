import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";

function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@raa.kg`;
}

export async function POST(request: Request) {
  try {
    const { name, phone, role } = await request.json();

    if (!name || !phone || !role) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    if (!["admin", "manager"].includes(role)) {
      return NextResponse.json({ error: "Недопустимая роль" }, { status: 400 });
    }

    const email = phoneToEmail(phone);
    const adminAuth = getAdminAuth();
    const db = getAdminFirestore();

    let uid: string;
    try {
      const existing = await adminAuth.getUserByEmail(email);
      uid = existing.uid;
    } catch {
      const newUser = await adminAuth.createUser({ email });
      uid = newUser.uid;
    }

    const digits = phone.replace(/\D/g, "");
    const formattedPhone = digits.startsWith("996") ? `+${digits}` : phone;

    await db.collection("users").doc(uid).set({
      name,
      phone: formattedPhone,
      role,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Create Staff] Error:", err);
    return NextResponse.json({ error: "Ошибка создания аккаунта" }, { status: 500 });
  }
}
