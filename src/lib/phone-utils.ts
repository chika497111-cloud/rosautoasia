// Валидация и форматирование телефона для KG (+996) и RU (+7)

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return { valid: false, error: "Введите номер телефона" };
  }

  // Кыргызстан: +996 XXX XXX XXX (12 цифр с 996)
  if (digits.startsWith("996")) {
    if (digits.length !== 12) {
      return { valid: false, error: "Номер KG должен быть в формате +996 XXX XXX XXX" };
    }
    return { valid: true };
  }

  // Россия: +7 XXX XXX XX XX (11 цифр с 7)
  if (digits.startsWith("7") && digits.length === 11) {
    return { valid: true };
  }

  return {
    valid: false,
    error: "Номер должен начинаться с +996 (Кыргызстан) или +7 (Россия)",
  };
}

export function formatPhoneInput(value: string): string {
  // Разрешаем только цифры и +
  let cleaned = value.replace(/[^\d+]/g, "");

  // Если начинается не с +, добавляем
  if (cleaned && !cleaned.startsWith("+")) {
    // Если начинается с 996 или 7, добавляем +
    if (cleaned.startsWith("996") || cleaned.startsWith("7")) {
      cleaned = "+" + cleaned;
    }
  }

  return cleaned;
}
