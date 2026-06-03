const TABLE: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const MASTER = new Set([11, 22]); // 33 => 6 (regra editorial)

/* ================= UTILITÁRIOS ================= */
export const normalizeChar = (ch: string): string =>
  ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

const isLetter = (c: string): boolean => /^[A-Z]$/.test(c);

const sumDigits = (n: number): number =>
  Math.abs(n).toString().split("").reduce((acc, d) => acc + (/\d/.test(d) ? +d : 0), 0);

export const reduceNumber = (num: number, preserveMaster = true): number => {
  if (num === 33) return 6; // regra especial
  if (preserveMaster && MASTER.has(num)) return num;
  while (num > 9) {
    const s = sumDigits(num);
    if (s === 33) return 6;
    if (preserveMaster && MASTER.has(s)) return s;
    num = s;
  }
  return num;
};

const valueFor = (c: string): number => TABLE[c] ?? 0;

/* =============== NOME: Y por CONTEXTO (IF) =============== */
const nameLetters = (name: string): string[] =>
  Array.from(name).map(normalizeChar).filter(isLetter);

const isAEIOU = (c: string): boolean => "AEIOU".includes(c);
const isStdConsonant = (c: string): boolean => isLetter(c) && !isAEIOU(c) && c !== "Y";

/** Y como VOGAL por contexto (AEIOU sempre vogais) */
const isVowelAt = (letters: string[], i: number): boolean => {
  const c = letters[i];
  if (isAEIOU(c)) return true;
  if (c !== "Y") return false;
  const prev = i > 0 ? letters[i - 1] : null;
  const next = i < letters.length - 1 ? letters[i + 1] : null;
  const prevIsCons = prev ? isStdConsonant(prev) : false;
  const nextIsCons = next ? isStdConsonant(next) : false;
  if (i === 0 && nextIsCons) return true;
  if (i === letters.length - 1 && prevIsCons) return true;
  if (prevIsCons && nextIsCons) return true;
  return false;
};

const sumByPredicate = (
  letters: string[],
  predicate: (letters: string[], idx: number) => boolean
): number =>
  letters.reduce((acc, _c, i) => (predicate(letters, i) ? acc + valueFor(letters[i]) : acc), 0);

/* =============== NÚMEROS DO NOME =============== */
/** ALMA — VOGAIS */
export const calculateSoulNumber = (fullName: string): number => {
  const letters = nameLetters(fullName);
  const total = sumByPredicate(letters, (arr, i) => isVowelAt(arr, i));
  return reduceNumber(total, true);
};
/** SONHO — CONSOANTES */
export const calculateDreamNumber = (fullName: string): number => {
  const letters = nameLetters(fullName);
  const total = sumByPredicate(letters, (arr, i) => !isVowelAt(arr, i));
  return reduceNumber(total, true);
};
/** TALENTO (Expressão) — Alma + Personalidade */
export const calculateTalentNumber = (fullName: string): number => {
  const soul = calculateSoulNumber(fullName);
  const personality = calculateDreamNumber(fullName);
  const total = soul + personality;
  return reduceNumber(total, true);
};

/** DESTINO — soma da data de nascimento */
export const calculateDestinyNumber = (birthDate: string): number => {
  const digits = birthDate.replace(/\D/g, '');
  const total = Array.from(digits).reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduceNumber(total, true);
};

/** DOM DO DESTINO — Talento + Destino */
export const calculateDomNumber = (fullName: string, birthDate: string): number => {
  const talent = calculateTalentNumber(fullName);
  const destiny = calculateDestinyNumber(birthDate);
  const total = talent + destiny;
  return reduceNumber(total, true);
};


/* =============== INTERFACE E FUNÇÃO PRINCIPAL =============== */
export interface NumerologyResult {
  soul: number;
  dom: number;
  destiny: number;
  talent: number;
  dream: number;
}

export function calculateAllNumbers(fullName: string, birthDate: string): NumerologyResult {
  return {
    soul: calculateSoulNumber(fullName),
    dom: calculateDomNumber(fullName, birthDate),
    destiny: calculateDestinyNumber(birthDate),
    talent: calculateTalentNumber(fullName),
    dream: calculateDreamNumber(fullName)
  };
}

