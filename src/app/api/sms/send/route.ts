import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

const NIKITA_LOGIN = process.env.NIKITA_LOGIN!;
const NIKITA_PWD = process.env.NIKITA_PWD!;
const NIKITA_SENDER = process.env.NIKITA_SENDER || "SMSPRO.KG";
const SMS_ENDPOINT = "https://smspro.nikita.kg/api/message";

/** Generate a random 4-digit OTP code */
function generateOTP(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Номер телефона обязателен" }, { status: 400 });
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      return NextResponse.json({ error: "Неверный формат номера" }, { status: 400 });
    }

    const code = generateOTP();
    const messageId = "raa" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    // Send SMS via Nikita XML API
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<message>
<login>${NIKITA_LOGIN}</login>
<pwd>${NIKITA_PWD}</pwd>
<id>${messageId}</id>
<sender>${NIKITA_SENDER}</sender>
<text>Ваш код для входа в RosAutoAsia: ${code}. Действует 5 мин.</text>
<phones>
<phone>${digits}</phone>
</phones>
</message>`;

    const res = await fetch(SMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xml,
    });

    const responseText = await res.text();

    // Parse status from XML response
    const statusMatch = responseText.match(/<status>(\d+)<\/status>/);
    const status = statusMatch ? parseInt(statusMatch[1], 10) : -1;

    if (status !== 0) {
      console.error("[SMS Send] Nikita error, status:", status, responseText);

      const errorMessages: Record<number, string> = {
        1: "Ошибка формата запроса",
        2: "Ошибка авторизации SMS-сервиса",
        4: "Недостаточно средств на SMS-счёте",
        5: "Имя отправителя не согласовано",
        7: "Некорректный номер телефона",
      };

      return NextResponse.json(
        { error: errorMessages[status] || "Не удалось отправить SMS. Попробуйте позже." },
        { status: 500 }
      );
    }

    // Store OTP in Firestore with 5-minute expiry
    const db = getAdminFirestore();
    const formattedPhone = digits.startsWith("996") ? `+${digits}` : `+${digits}`;

    await db.collection("sms_codes").doc(formattedPhone).set({
      code,
      phone: formattedPhone,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SMS Send] Error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
