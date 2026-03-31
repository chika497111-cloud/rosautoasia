"use server";

import nodemailer from "nodemailer";

const GMAIL_USER = "chika497111@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

export async function sendContactEmail(data: {
  name: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean }> {
  if (!GMAIL_APP_PASSWORD) {
    console.error("GMAIL_APP_PASSWORD not set");
    return { success: false };
  }

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #FFF8F5; }
    .container { max-width: 560px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9d4300, #f97316); border-radius: 16px 16px 0 0; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 13px; }
    .body { background: white; padding: 30px; border: 1px solid #f0e6df; border-top: none; }
    .field { margin-bottom: 20px; }
    .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9d4300; font-weight: 700; margin-bottom: 6px; }
    .field-value { font-size: 16px; color: #451A03; line-height: 1.5; }
    .message-box { background: #FFF8F5; border-left: 4px solid #f97316; border-radius: 8px; padding: 16px 20px; margin-top: 4px; }
    .footer { background: #451A03; border-radius: 0 0 16px 16px; padding: 20px 30px; text-align: center; }
    .footer p { color: rgba(255,251,235,0.6); margin: 0; font-size: 12px; }
    .footer a { color: #f97316; text-decoration: none; font-weight: 600; }
    .divider { height: 1px; background: #f0e6df; margin: 20px 0; }
    .badge { display: inline-block; background: #f97316; color: white; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📩 Новая заявка с сайта</h1>
      <p>raa.kg • ${new Date().toLocaleDateString("ru-RU")} в ${new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="field-label">Имя клиента</div>
        <div class="field-value">${escapeHtml(data.name)}</div>
      </div>
      <div class="field">
        <div class="field-label">Телефон</div>
        <div class="field-value">
          ${data.phone ? `<a href="tel:${escapeHtml(data.phone)}" style="color:#9d4300;text-decoration:none;font-weight:600">${escapeHtml(data.phone)}</a>` : '<span style="color:#999">Не указан</span>'}
        </div>
      </div>
      <div class="divider"></div>
      <div class="field">
        <div class="field-label">Сообщение</div>
        <div class="message-box">
          <div class="field-value">${escapeHtml(data.message).replace(/\n/g, "<br>")}</div>
        </div>
      </div>
      <div class="divider"></div>
      <div style="text-align:center">
        <span class="badge">Требует ответа</span>
      </div>
    </div>
    <div class="footer">
      <p>ROSAutoAsia • <a href="https://raa.kg/admin">Перейти в админ-панель</a></p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"ROSAutoAsia" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: `📩 Заявка с сайта от ${data.name}`,
      html: htmlBody,
    });
    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
