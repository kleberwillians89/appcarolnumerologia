/**
 * EXEMPLOS PRÁTICOS: CICLOS TRIMESTRAIS COM NÚMERO 0
 * 
 * Este arquivo documenta casos reais onde trimestre 0 ocorre
 */

import { calculateQuarterCycles, calculateDestinyPath } from '../numerologyCalculations2';

export interface QuarterCycleExample {
  date: string;
  day: number;
  month: number;
  year: number;
  destinyPath: number;
  cycles: number[];
  explanation: string;
}

/**
 * Casos documentados de trimestre 0
 */
export const zeroExamples: QuarterCycleExample[] = [
  {
    date: "18/09/1981",
    day: 18,
    month: 9,
    year: 1981,
    destinyPath: 0,
    cycles: [],
    explanation: "Dia 18→9, Mês 9, Ano 1981→1. Destino: 9+9+1=19→1. Q1: 9+1=10→1, Q2: 9+1=10→1"
  },
  {
    date: "27/09/1990",
    day: 27,
    month: 9,
    year: 1990,
    destinyPath: 0,
    cycles: [],
    explanation: "Múltiplos de 9 em dia e mês aumentam chance de trimestre 0"
  }
];

/**
 * Executa exemplos e preenche resultados reais
 */
export const runExamples = (): QuarterCycleExample[] => {
  return zeroExamples.map(ex => ({
    ...ex,
    destinyPath: calculateDestinyPath(ex.day, ex.month, ex.year),
    cycles: calculateQuarterCycles(ex.day, ex.month, ex.year)
  }));
};

/**
 * Busca datas que resultam em trimestre 0
 */
export const findZeroCycles = (startYear: number, endYear: number): QuarterCycleExample[] => {
  const results: QuarterCycleExample[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 28; day++) {
        const cycles = calculateQuarterCycles(day, month, year);
        if (cycles.includes(0)) {
          results.push({
            date: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`,
            day,
            month,
            year,
            destinyPath: calculateDestinyPath(day, month, year),
            cycles,
            explanation: `Trimestre(s) 0 encontrado(s): ${cycles.map((c, i) => c === 0 ? `Q${i+1}` : '').filter(Boolean).join(', ')}`
          });
        }
      }
    }
  }
  
  return results;
};
