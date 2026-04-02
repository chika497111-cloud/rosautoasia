import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";

/** Convert phone to fake email for Firebase Auth */
function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@raa.kg`;
}

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Телефон и код обязательны" }, { status: 400 });
    }

    const digits = phone.replace(/\D/g, "");
    const formattedPhone = `+${digits}`;
    const db = getAdminFirestore();

    // Get stored OTP
    const otpDoc = await db.collection("sms_codes").doc(formattedPhone).get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: "Код не найден. Запросите новый." }, { status: 400 });
    }

    const otpData = otpDoc.data()!;

    // Check expiry
    if (Date.now() > otpData.expiresAt) {
      await db.collection("sms_codes").doc(formattedPhone).delete();
      return NextResponse.json({ error: "Код истёк. Запросите новый." }, { status: 400 });
    }

    // Check attempts (max 5)
    if (otpData.attempts >= 5) {
      await db.collection("sms_codes").doc(formattedPhone).delete();
      return NextResponse.json({ error: "Слишком много попыток. Запросите новый код." }, { status: 400 });
    }

    // Increment attempts
    await db.collection("sms_codes").doc(formattedPhone).update({
      attempts: (otpData.attempts || 0) + 1,
    });

    // Verify code
    if (otpData.code !== code.trim()) {
      return NextResponse.json({ error: "Неверный код. Попробуйте ещё раз." }, { status: 400 });
    }

    // Code correct! Delete it
    await db.collection("sms_codes").doc(formattedPhone).delete();

    // Check if user exists in Firestore
    const adminAuth = getAdminAuth();
    const phonesToSearch = [formattedPhone, digits, phone];
    let userId: string | null = null;

    for (const p of phonesToSearch) {
      const snap = await db.collection("users").where("phone", "==", p).limit(1).get();
      if (!snap.empty) {
        userId = snap.docs[0].id;
        break;
      }
    }

    if (userId) {
      // Existing user — create custom token
      const token = await adminAuth.createCustomToken(userId);
      return NextResponse.json({ success: true, token, isNewUser: false });
    }

    // New user — create Firebase Auth account + minimal Firestore profile
    const email = phoneToEmail(phone);
    let newUid: string;

    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      newUid = existingUser.uid;
    } catch {
      const newUser = await adminAuth.createUser({ email });
      newUid = newUser.uid;
    }

    await db.collection("users").doc(newUid).set({
      phone: formattedPhone,
      name: "",
      firstName: "",
      lastName: "",
      role: "client",
      createdAt: new Date().toISOString(),
    });

    const token = await adminAuth.createCustomToken(newUid);
    return NextResponse.json({ success: true, token, isNewUser: true });
  } catch (err) {
    console.error("[SMS Verify] Error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
