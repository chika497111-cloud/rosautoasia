import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";

// One-time setup endpoint to create admin account
// DELETE THIS FILE AFTER USE
const SETUP_SECRET = "raa-setup-2026";

function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@raa.kg`;
}

export async function POST(request: Request) {
  try {
    const { secret, phone, name } = await request.json();

    if (secret !== SETUP_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    const formattedPhone = `+${digits}`;

    await db.collection("users").doc(uid).set({
      phone: formattedPhone,
      name: name || "Admin",
      firstName: name || "Admin",
      lastName: "",
      role: "admin",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, uid, phone: formattedPhone });
  } catch (err) {
    console.error("[Setup Admin] Error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
