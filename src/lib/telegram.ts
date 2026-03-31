const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";

// Chat IDs for admin notifications — will be populated by /start command
// For now, use the bot's getUpdates to find chat_id
let ADMIN_CHAT_IDS: string[] = [];

/**
 * Send a message via Telegram Bot API
 */
async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );
    return response.ok;
  } catch {
    console.error("Failed to send Telegram message");
    return false;
  }
}

/**
 * Get admin chat IDs from recent bot messages
 */
async function getAdminChatIds(): Promise<string[]> {
  if (ADMIN_CHAT_IDS.length > 0) return ADMIN_CHAT_IDS;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=100`
    );
    if (response.ok) {
      const data = await response.json();
      const chatIds = new Set<string>();
      for (const update of data.result || []) {
        const chatId = update.message?.chat?.id;
        if (chatId) chatIds.add(String(chatId));
      }
      ADMIN_CHAT_IDS = Array.from(chatIds);
    }
  } catch {
    // ignore
  }
  return ADMIN_CHAT_IDS;
}

/**
 * Notify admins about a new order
 */
export async function notifyNewOrder(order: {
  number: string;
  userName: string;
  userPhone: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
  comment?: string;
  deliveryMethod?: string;
  city?: string;
}): Promise<void> {
  const chatIds = await getAdminChatIds();
  if (chatIds.length === 0) {
    console.warn("No Telegram chat IDs found. Send /start to the bot first.");
    return;
  }

  const itemsList = order.items
    .map((i) => `  • ${i.name} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString("ru-RU")} сом`)
    .join("\n");

  const text = [
    `🛒 <b>Новый заказ #${order.number}</b>`,
    ``,
    `👤 ${order.userName}`,
    `📱 ${order.userPhone}`,
    order.city ? `📍 ${order.city}` : "",
    order.deliveryMethod ? `🚚 ${order.deliveryMethod}` : "",
    ``,
    `<b>Товары:</b>`,
    itemsList,
    ``,
    `💰 <b>Итого: ${order.total.toLocaleString("ru-RU")} сом</b>`,
    order.comment ? `\n💬 ${order.comment}` : "",
    ``,
    `🔗 https://raa.kg/admin`,
  ]
    .filter(Boolean)
    .join("\n");

  for (const chatId of chatIds) {
    await sendTelegramMessage(chatId, text);
  }
}
