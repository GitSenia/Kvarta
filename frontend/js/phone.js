const BY_OPERATORS = new Set(["25", "29", "33", "44"]);

/** Нормализует белорусский мобильный к +375XXXXXXXXX или возвращает null. */
export function normalizeByPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("80") && digits.length === 11) {
    digits = `375${digits.slice(2)}`;
  } else if (digits.startsWith("0") && digits.length === 10) {
    digits = `375${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith("375")) {
    const operator = digits.slice(3, 5);
    if (BY_OPERATORS.has(operator)) {
      return `+${digits}`;
    }
  }

  return null;
}

export const PHONE_HINT =
  "Укажите белорусский мобильный в формате +375 XX XXX XX XX (25, 29, 33, 44)";
