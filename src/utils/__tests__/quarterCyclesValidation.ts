/**
 * VALIDAÇÃO E TESTES: CICLOS TRIMESTRAIS COM NÚMERO 0
 * 
 * CONDIÇÕES MATEMÁTICAS PARA TRIMESTRE 0:
 * ========================================
 * 
 * O número 0 em ciclos trimestrais é RARO e ocorre aproximadamente a cada 9 anos.
 * 
 * QUANDO OCORRE:
 * - Quando a soma dos componentes resulta em múltiplo de 9 (9, 18, 27, 36...)
 * - E a redução numerológica considera 9 = 0 em contexto de ciclos
 * 
 * FÓRMULA DOS CICLOS:
 * - Q1 = reduceNumber(Mês + CaminhoDestino)
 * - Q2 = reduceNumber(Dia + CaminhoDestino)
 * - Q3 = reduceNumber(Ano + CaminhoDestino)
 * - Q4 = reduceNumber(Q1 + Q2 + Q3)
 * 
 * EXEMPLO PRÁTICO (Trimestre 0):
 * Data: 18/09/1981
 * - Dia reduzido: 9
 * - Mês reduzido: 9
 * - Ano reduzido: 1+9+8+1 = 19 → 1+9 = 10 → 1
 * - Caminho Destino: 9+9+1 = 19 → 10 → 1
 * - Q1 = 9 + 1 = 10 → 1
 * - Q2 = 9 + 1 = 10 → 1
 * - Q3 = 1 + 1 = 2
 * - Q4 = 1 + 1 + 2 = 4
 * 
 * Para Q1 = 0: Mês(9) + Destino(9) = 18 → 9 → 0 (em ciclos)
 */

import { calculateQuarterCycles, calculateDestinyPath } from '../numerologyCalculations2';
import { reduceNumber } from '../numerologyCalculations';

/**
 * Testa se calculateQuarterCycles pode retornar 0
 */
export const testQuarterCycleZero = () => {
  const testCases = [
    { day: 18, month: 9, year: 1981, desc: "18/09/1981 - Soma 9+9" },
    { day: 27, month: 9, year: 1990, desc: "27/09/1990 - Múltiplos de 9" },
    { day: 9, month: 18, year: 1999, desc: "09/18/1999 - Ano 9" },
  ];

  const results = testCases.map(tc => {
    const cycles = calculateQuarterCycles(tc.day, tc.month, tc.year);
    const hasZero = cycles.includes(0);
    return { ...tc, cycles, hasZero };
  });

  return results;
};

/**
 * Valida condições matemáticas para trimestre 0
 */
export const validateZeroConditions = (day: number, month: number, year: number) => {
  const dp = calculateDestinyPath(day, month, year);
  
  // Componentes reduzidos
  const m = reduceNumber(month, true);
  const d = reduceNumber(day, true);
  const y = reduceNumber(year, true);
  
  // Somas antes da redução
  const sum1 = m + dp;
  const sum2 = d + dp;
  const sum3 = y + dp;
  
  // Verifica se alguma soma é múltiplo de 9
  const isMultipleOf9 = (n: number) => n % 9 === 0 && n > 0;
  
  return {
    destinyPath: dp,
    components: { month: m, day: d, year: y },
    sums: { q1: sum1, q2: sum2, q3: sum3 },
    canBeZero: {
      q1: isMultipleOf9(sum1),
      q2: isMultipleOf9(sum2),
      q3: isMultipleOf9(sum3),
    }
  };
};
