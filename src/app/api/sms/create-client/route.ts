import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";

function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@raa.kg`;
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, phone, city, address } = await request.json();

    if (!firstName || !phone) {
      return NextResponse.json({ error: "Имя и телефон обязательны" }, { status: 400 });
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
    const name = [firstName, lastName].filter(Boolean).join(" ");

    await db.collection("users").doc(uid).set({
      name,
      firstName,
      lastName,
      phone: formattedPhone,
      city: city || "",
      address: address || "",
      role: "client",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Create Client] Error:", err);
    return NextResponse.json({ error: "Ошибка создания клиента" }, { status: 500 });
  }
}
