import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";

const NIKITA_API_KEY = process.env.NIKITA_API_KEY!;
const OTP_CHECK_ENDPOINT = "https://smspro.nikita.kg/api/otp/check";

/** Convert phone to fake email for Firebase Auth: +996555000000 -> 996555000000@raa.kg */
function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@raa.kg`;
}

export async function POST(request: Request) {
  try {
    const { phone, code, transactionId } = await request.json();

    if (!phone || !code || !transactionId) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    // Verify OTP with Nikita
    const url = `${OTP_CHECK_ENDPOINT}?api_key=${NIKITA_API_KEY}&transaction_id=${transactionId}&code=${code}`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();

    if (data.status !== 0) {
      return NextResponse.json({ error: "Неверный код. Попробуйте ещё раз." }, { status: 400 });
    }

    // OTP verified! Now check if user exists in Firestore
    const digits = phone.replace(/\D/g, "");
    const db = getAdminFirestore();
    const adminAuth = getAdminAuth();

    // Search by phone (try with + and without)
    const phonesToSearch = [`+${digits}`, digits, phone];
    let userId: string | null = null;
    let isNewUser = false;

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
      // Check if Auth user already exists (e.g. from old password-based registration)
      const existingUser = await adminAuth.getUserByEmail(email);
      newUid = existingUser.uid;
    } catch {
      // User doesn't exist in Auth — create new one
      const newUser = await adminAuth.createUser({ email });
      newUid = newUser.uid;
    }

    // Write minimal Firestore profile (name will be filled in next step)
    const formattedPhone = digits.startsWith("996") ? `+${digits}` : phone;
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
