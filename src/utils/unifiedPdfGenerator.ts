// src/utils/unifiedPdfGenerator.ts
import { NumerologyResult } from './numerologyCalculations';
import { generateMapaDaAlmaPDF } from './mapaDaAlmaPdfGenerator';

interface UnifiedPdfData {
  numerology?: {
    results: NumerologyResult;
    name: string;
    birthDate: string;
  };
  personalYear?: {
    year: number;
    birthMonth: number;
    day: string;
    month: string;
  };
  compatibility?: any; // estrutura flexível (pode vir como string/number)
}

/**
 * Função unificada para gerar o PDF "Mapa da Alma".
 * Use esta função em TODOS os botões "Baixar PDF".
 */
export const generateUnifiedMapaDaAlmaPDF = async (
  data: UnifiedPdfData,
  previewMode = false
) => {
  if (!data?.numerology) {
    throw new Error(
      'Para gerar o PDF "Mapa da Alma", calcule primeiro a Numerologia.'
    );
  }

  // repassa exatamente o que tivermos (ano pessoal/compat podem estar ausentes)
  return await generateMapaDaAlmaPDF(
    {
      numerology: data.numerology,
      personalYear: data.personalYear,
      compatibility: data.compatibility,
    },
    previewMode
  );
};

/**
 * Helper opcional para montar o objeto em telas/botões.
 */
export const collectAllPdfData = (
  numerologyData?: { results: NumerologyResult; name: string; birthDate: string },
  personalYearData?: { year: number; birthMonth: number; day: string; month: string },
  compatibilityData?: any
): UnifiedPdfData => {
  const payload: UnifiedPdfData = {};
  if (numerologyData) payload.numerology = numerologyData;
  if (personalYearData) payload.personalYear = personalYearData;
  if (compatibilityData) payload.compatibility = compatibilityData;
  return payload;
};
