import { reduceNumber } from './numerologyCalculations';

const sumDigits = (n: number): number =>
  Math.abs(n).toString().split("").reduce((acc, d) => acc + (/\d/.test(d) ? +d : 0), 0);

const redDay   = (day: number,   preserveMaster = true) => reduceNumber(sumDigits(day),   preserveMaster);
const redMonth = (month: number, preserveMaster = true) => reduceNumber(sumDigits(month), preserveMaster);
const redYear  = (year: number,  preserveMaster = true) => reduceNumber(sumDigits(year),  preserveMaster);

/* =============== NÚMEROS DA DATA =============== */
/** CAMINHO DE DESTINO — componentes com mestres preservados */
export const calculateDestinyPath = (day: number, month: number, year: number): number => {
  const rd = redDay(day, true);
  const rm = redMonth(month, true);
  const ry = redYear(year, true);
  return reduceNumber(rd + rm + ry, true);
};

/* =============== DESAFIOS (Variante A) =============== */
export const calculateChallenges = (day: number, month: number, year: number) => {
  const d = redDay(day, false);
  const m = redMonth(month, false);
  const y = redYear(year, false);
  const first  = Math.abs(d - m);        // 0–28
  const second = Math.abs(m - y);        // 29–56
  const major  = Math.abs(first - second); // vida toda
  return {
    first:  { label: "1º Desafio", range: [0, 28] as [number, number], value: first },
    second: { label: "2º Desafio", range: [29, 56] as [number, number], value: second },
    major:  { label: "Desafio Maior", range: [0, Infinity] as [number, number], value: major },
  };
};

/* =============== CICLOS DE VIDA =============== */
export const calculateLifeCycles = (day: number, month: number, year: number) => {
  const c1 = redMonth(month, true);
  const c2 = redDay(day, true);
  const c3 = redYear(year, true);
  return {
    first:  { label: "1º Ciclo", range: [0, 28] as [number, number], value: c1 },
    second: { label: "2º Ciclo", range: [29, 56] as [number, number], value: c2 },
    third:  { label: "3º Ciclo", range: [57, Infinity] as [number, number], value: c3 },
  };
};

/* =============== CICLOS TRIMESTRAIS =============== */
/**
 * Redução especial para ciclos trimestrais:
 * - Múltiplos de 9 (9, 18, 27, 36...) retornam 0 (raro, ~1 a cada 9 anos)
 * - Números mestres (11, 22) são preservados
 * - Demais números reduzem normalmente para 1-9
 * 
 * CONDIÇÕES PARA TRIMESTRE 0:
 * Ocorre quando (Componente + CaminhoDestino) resulta em múltiplo de 9
 * Exemplo: Mês(9) + Destino(9) = 18 → 0
 */
const reduceForQuarterCycle = (num: number): number => {
  // Verifica múltiplo de 9 ANTES de reduzir
  if (num > 0 && num % 9 === 0) return 0;
  // Preserva mestres e reduz normalmente
  return reduceNumber(num, true);
};

export const calculateQuarterCycles = (day: number, month: number, year: number): number[] => {
  const dp = calculateDestinyPath(day, month, year);
  const c1 = redMonth(month, true);
  const c2 = redDay(day, true);
  const c3 = redYear(year, true);
  const q1 = reduceForQuarterCycle(c1 + dp);
  const q2 = reduceForQuarterCycle(c2 + dp);
  const q3 = reduceForQuarterCycle(c3 + dp);
  const q4 = reduceForQuarterCycle(q1 + q2 + q3);
  return [q1, q2, q3, q4];
};



/* =============== ANO PESSOAL =============== */
export const calculatePersonalYear = (day: number, month: number, currentYear: number): number => {
  const rd = redDay(day, false);
  const rm = redMonth(month, false);
  const ry = redYear(currentYear, false);
  return reduceNumber(rd + rm + ry, false);
};

/* =============== MÊS PESSOAL =============== */
export const calculatePersonalMonth = (personalYear: number, currentMonth: number): number => {
  return reduceNumber(personalYear + currentMonth, false);
};




/* =============== CHALLENGE NUMBERS (Alias) =============== */
export const calculateChallengeNumbers = (day: number, month: number, year: number) => {
  const challenges = calculateChallenges(day, month, year);
  return {
    first: challenges.first.value,
    second: challenges.second.value,
    major: challenges.major.value
  };
};

/* =============== PRESENTES (Pinnacles) =============== */
export const calculatePresents = (day: number, month: number, year: number) => {
  const d = redDay(day, true);
  const m = redMonth(month, true);
  const y = redYear(year, true);
  const p1 = reduceNumber(d + m, true);
  const p2 = reduceNumber(d + y, true);
  const p3 = reduceNumber(p1 + p2, true);
  const p4 = reduceNumber(m + y, true);
  return {
    first:  { label: "1º Presente", range: [0, 29] as [number, number], value: p1 },
    second: { label: "2º Presente", range: [30, 39] as [number, number], value: p2 },
    third:  { label: "3º Presente", range: [40, 49] as [number, number], value: p3 },
    fourth: { label: "4º Presente", range: [50, Infinity] as [number, number], value: p4 },
  };
};

