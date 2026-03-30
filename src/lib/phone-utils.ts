// Валидация и форматирование телефона для KG, RU, KZ, UZ, TJ, CN

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

  // Узбекистан: +998 XX XXX XX XX (12 цифр с 998)
  if (digits.startsWith("998")) {
    if (digits.length !== 12) {
      return { valid: false, error: "Номер UZ должен быть в формате +998 XX XXX XX XX" };
    }
    return { valid: true };
  }

  // Таджикистан: +992 XX XXX XX XX (12 цифр с 992)
  if (digits.startsWith("992")) {
    if (digits.length !== 12) {
      return { valid: false, error: "Номер TJ должен быть в формате +992 XX XXX XX XX" };
    }
    return { valid: true };
  }

  // Казахстан: +7 7XX XXX XX XX (11 цифр, начинается с 77)
  if (digits.startsWith("77") && digits.length === 11) {
    return { valid: true };
  }

  // Россия: +7 XXX XXX XX XX (11 цифр с 7, но НЕ 77)
  if (digits.startsWith("7") && !digits.startsWith("77") && digits.length === 11) {
    return { valid: true };
  }

  // Китай: +86 XXX XXXX XXXX (13 цифр с 86)
  if (digits.startsWith("86")) {
    if (digits.length !== 13) {
      return { valid: false, error: "Номер CN должен быть в формате +86 XXX XXXX XXXX" };
    }
    return { valid: true };
  }

  // Если начинается с 7 но неправильная длина
  if (digits.startsWith("7")) {
    return {
      valid: false,
      error: "Номер +7 должен содержать 11 цифр (Россия/Казахстан)",
    };
  }

  return {
    valid: false,
    error: "Поддерживаемые коды: +996 (KG), +7 (RU/KZ), +998 (UZ), +992 (TJ), +86 (CN)",
  };
}

export function formatPhoneInput(value: string): string {
  // Разрешаем только цифры и +
  let cleaned = value.replace(/[^\d+]/g, "");

  // Если начинается не с +, добавляем
  if (cleaned && !cleaned.startsWith("+")) {
    // Если начинается с известного кода, добавляем +
    if (
      cleaned.startsWith("996") ||
      cleaned.startsWith("998") ||
      cleaned.startsWith("992") ||
      cleaned.startsWith("86") ||
      cleaned.startsWith("7")
    ) {
      cleaned = "+" + cleaned;
    }
  }

  return cleaned;
}
