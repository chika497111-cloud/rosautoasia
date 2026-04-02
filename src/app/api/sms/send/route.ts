import { NextResponse } from "next/server";

const NIKITA_API_KEY = process.env.NIKITA_API_KEY!;
const OTP_ENDPOINT = "https://smspro.nikita.kg/api/otp";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Номер телефона обязателен" }, { status: 400 });
    }

    // Strip everything except digits
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      return NextResponse.json({ error: "Неверный формат номера" }, { status: 400 });
    }

    // Generate unique transaction_id (max 32 chars, alphanumeric)
    const transactionId =
      "raa" + digits.slice(-6) + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    // Call Nikita OTP API
    const url = `${OTP_ENDPOINT}?api_key=${NIKITA_API_KEY}&transaction_id=${transactionId}&phone=${digits}`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();

    if (data.status !== 0) {
      console.error("[SMS Send] Nikita error:", data);
      return NextResponse.json(
        { error: "Не удалось отправить SMS. Попробуйте позже." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, transactionId });
  } catch (err) {
    console.error("[SMS Send] Error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
