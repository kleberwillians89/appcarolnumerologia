import { calculateAllNumbers, NumerologyResult } from '@/utils/numerologyCalculations';
import { calculatePersonalYear } from '@/utils/numerologyCalculations2';
import { generateCompletePDF } from '@/utils/completePersonalYearPdf';
import { generateMapaDaAlmaPDF } from '@/utils/mapaDaAlmaPdfGenerator';
import { CompatibilidadeData } from '@/utils/mapaDaAlmaPdfTypes';

export type PdfProductKey = 'mapa' | 'ano_pessoal';
export type PdfProduct = PdfProductKey;

export interface PdfClient {
  nome: string;
  dataNascimento: string;
  telefone: string;
  email?: string;
}

export interface PdfGenerationInput {
  produto: PdfProductKey;
  cliente: PdfClient;
  dadosNumerologicos: {
    results?: NumerologyResult | null;
    personalYear?: {
      year?: number;
      birthMonth?: number;
      day?: string;
      month?: string;
      referenceYear?: number;
    } | null;
    compatibility?: CompatibilidadeData | null;
  };
  origem: 'plataforma' | 'entregas' | 'site' | 'google_sheets';
}

export interface PdfGenerationResult {
  success: boolean;
  linkPdf?: string | null;
  pdfBlob?: Blob;
  pdfDataUrl?: string | null;
  fileName?: string;
  generatedAt?: string;
  error?: string;
}

const validateClient = (input: PdfGenerationInput): string | null => {
  if (!input.cliente.nome || !input.cliente.dataNascimento) {
    return 'Preencha nome e data de nascimento antes de gerar o PDF.';
  }

  return null;
};

const getBirthParts = (birthDate: string) => {
  const [year, month, day] = birthDate.split('-').map(Number);
  return { year, month, day };
};

const createLocalPdfLink = (fileName: string) => `local://${fileName}`;

export const generatePdfForProduct = async (input: PdfGenerationInput): Promise<PdfGenerationResult> => {
  const validationError = validateClient(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    if (input.produto === 'mapa') {
      const numerologyResults = input.dadosNumerologicos.results || calculateAllNumbers(input.cliente.nome, input.cliente.dataNascimento);

      const result = await generateMapaDaAlmaPDF(
        {
          numerology: {
            results: numerologyResults,
            name: input.cliente.nome,
            birthDate: input.cliente.dataNascimento,
          },
          personalYear: input.dadosNumerologicos.personalYear?.year
            ? {
                year: input.dadosNumerologicos.personalYear.year,
                birthMonth: input.dadosNumerologicos.personalYear.birthMonth || getBirthParts(input.cliente.dataNascimento).month,
                day: input.dadosNumerologicos.personalYear.day || String(getBirthParts(input.cliente.dataNascimento).day),
                month: input.dadosNumerologicos.personalYear.month || String(getBirthParts(input.cliente.dataNascimento).month),
              }
            : undefined,
          compatibility: input.dadosNumerologicos.compatibility,
        },
        true
      );

      if (!result?.pdf || !result.fileName) {
        return { success: false, error: 'Não foi possível gerar o PDF do Mapa.' };
      }

      return {
        success: true,
        linkPdf: createLocalPdfLink(result.fileName),
        pdfDataUrl: result.pdf.output('datauristring'),
        fileName: result.fileName,
        generatedAt: new Date().toISOString(),
      };
    }

    if (input.produto === 'ano_pessoal') {
      const { day, month } = getBirthParts(input.cliente.dataNascimento);
      const referenceYear = input.dadosNumerologicos.personalYear?.referenceYear || new Date().getFullYear();
      const py = input.dadosNumerologicos.personalYear?.year || calculatePersonalYear(day, month, referenceYear);

      const result = await generateCompletePDF(
        py,
        input.dadosNumerologicos.personalYear?.birthMonth || month,
        String(day),
        String(month),
        {
          clientName: input.cliente.nome,
          birthDate: input.cliente.dataNascimento,
          previewMode: true,
        }
      );

      if (!result?.pdf || !result.fileName) {
        return { success: false, error: 'Não foi possível gerar o PDF de Ano Pessoal.' };
      }

      return {
        success: true,
        linkPdf: createLocalPdfLink(result.fileName),
        pdfDataUrl: result.pdf.output('datauristring'),
        fileName: result.fileName,
        generatedAt: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: 'Produto não suportado para geração de PDF.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao gerar PDF.',
    };
  }
};
