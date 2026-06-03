export const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const normalizeBrazilianPhone = (value: string) => {
  const digits = onlyDigits(value);
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return `55${digits}`;
};

export const isValidBrazilianPhone = (value: string) => {
  const normalized = normalizeBrazilianPhone(value);
  return /^55\d{10,11}$/.test(normalized);
};

export const formatBrazilianPhone = (value: string) => {
  const rawDigits = onlyDigits(value);
  const digits = rawDigits.startsWith('55') && rawDigits.length > 11 ? rawDigits.slice(2) : rawDigits;

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};
