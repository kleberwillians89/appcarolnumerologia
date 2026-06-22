import { calculateAllNumbers, NumerologyResult } from '@/utils/numerologyCalculations';
import { calculatePersonalYear } from '@/utils/numerologyCalculations2';
import { generateCompletePDF } from '@/utils/completePersonalYearPdf';
import { generateMapaDaAlmaPDF } from '@/utils/mapaDaAlmaPdfGenerator';
import { CompatibilidadeData } from '@/utils/mapaDaAlmaPdfTypes';
import { jsPDF } from 'jspdf';

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

export const generateDemoPdf = ({
  clientName,
  productTitle,
  birthDate,
}: {
  clientName: string;
  productTitle: string;
  birthDate: string;
}): PdfGenerationResult => {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  pdf.setFillColor(6, 16, 29);
  pdf.rect(0, 0, 210, 297, 'F');
  pdf.setDrawColor(201, 169, 110);
  pdf.setLineWidth(0.6);
  pdf.rect(14, 14, 182, 269);
  pdf.setTextColor(201, 169, 110);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('CAROL GRABER NUMEROLOGIA', 105, 36, { align: 'center' });
  pdf.setTextColor(248, 245, 239);
  pdf.setFontSize(27);
  pdf.text(productTitle || 'Leitura Numerologica', 105, 65, { align: 'center', maxWidth: 160 });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(13);
  pdf.text(`Cliente: ${clientName || 'Cliente'}`, 28, 100);
  pdf.text(`Data de nascimento: ${birthDate || 'Nao informada'}`, 28, 112);
  pdf.setFillColor(16, 32, 51);
  pdf.roundedRect(28, 138, 154, 58, 3, 3, 'F');
  pdf.setTextColor(228, 201, 142);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('PDF DEMONSTRATIVO', 105, 158, { align: 'center' });
  pdf.setTextColor(248, 245, 239);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('Material gerado em ambiente de teste para validar o fluxo da plataforma.', 105, 177, { align: 'center', maxWidth: 130 });
  pdf.setTextColor(180, 180, 180);
  pdf.setFontSize(9);
  pdf.text('Este arquivo nao representa a entrega numerologica final.', 105, 258, { align: 'center' });

  const fileName = `demo-${productTitle || 'produto'}-${clientName || 'cliente'}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '.pdf';
  const pdfDataUrl = pdf.output('datauristring');

  if (!pdfDataUrl.startsWith('data:application/pdf') || pdfDataUrl.length < 1000) {
    return { success: false, error: 'O PDF demonstrativo não foi gerado corretamente.' };
  }

  return {
    success: true,
    linkPdf: createLocalPdfLink(fileName),
    pdfDataUrl,
    fileName,
    generatedAt: new Date().toISOString(),
  };
};

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

const buildPersonalYearForBirthDate = (input: PdfGenerationInput) => {
  const birthParts = getBirthParts(input.cliente.dataNascimento);
  const referenceYear = input.dadosNumerologicos.personalYear?.referenceYear || new Date().getFullYear();
  const year = input.dadosNumerologicos.personalYear?.year || calculatePersonalYear(birthParts.day, birthParts.month, referenceYear);

  return {
    year,
    birthMonth: input.dadosNumerologicos.personalYear?.birthMonth || birthParts.month,
    day: input.dadosNumerologicos.personalYear?.day || String(birthParts.day),
    month: input.dadosNumerologicos.personalYear?.month || String(birthParts.month),
    referenceYear,
  };
};

export const generatePdfForProduct = async (input: PdfGenerationInput): Promise<PdfGenerationResult> => {
  const validationError = validateClient(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    if (input.produto === 'mapa') {
      const numerologyResults = input.dadosNumerologicos.results || calculateAllNumbers(input.cliente.nome, input.cliente.dataNascimento);
      const personalYear = buildPersonalYearForBirthDate(input);

      const result = await generateMapaDaAlmaPDF(
        {
          numerology: {
            results: numerologyResults,
            name: input.cliente.nome,
            birthDate: input.cliente.dataNascimento,
          },
          personalYear,
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
      const personalYear = buildPersonalYearForBirthDate(input);

      const result = await generateCompletePDF(
        personalYear.year,
        personalYear.birthMonth || month,
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
