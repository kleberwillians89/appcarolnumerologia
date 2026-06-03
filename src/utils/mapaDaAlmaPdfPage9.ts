import jsPDF from 'jspdf';
import { CompatibilidadeData } from './mapaDaAlmaPdfTypes';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { initPagination, addPageIfNeeded, advanceY } from './pdfAutoPagination';

export function hasCompatibilityData(data?: CompatibilidadeData | null): boolean {
  if (!data) return false;
  const values = [
    data.percentualGeral,
    data.conexaoAlma?.pct,
    data.alinhamentoDestino?.pct,
    data.sinergiaTalentos?.pct,
    data.faseDaVida?.pct,
  ].filter((v) => typeof v === 'number') as number[];
  return values.some((v) => (v ?? 0) > 0);
}

export async function renderCompatibilidadePage(
  pdf: jsPDF,
  data?: CompatibilidadeData | null,
  opts?: { addBackground?: boolean }
): Promise<boolean> {
  if (!hasCompatibilityData(data)) return false;

  await addBackgroundImage(pdf, PDF_IMG.BG);

  const pagination = initPagination(MARGIN + 130, PDF_IMG.BG);

  addText(pdf, 'Compatibilidade', 297.5, pagination.currentY, { size: 26, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' });
  pagination.currentY += 30;

  // Box do percentual geral
  await addPageIfNeeded(pdf, pagination, 70, 15);
  addBox(pdf, MARGIN, pagination.currentY, CONTENT_WIDTH, 70, { fill: COLORS.panel, border: COLORS.line, radius: 12 });
  pdf.setFontSize(42);
  pdf.setTextColor(...COLORS.charcoal);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data!.percentualGeral}%`, 297.5, pagination.currentY + 48, { align: 'center' });
  advanceY(pagination, 70, 15);

  // Seções sem boxes
  const secoes = [
    { label: 'Conexão da Alma', pct: data!.conexaoAlma.pct, texto: data!.conexaoAlma.texto },
    { label: 'Alinhamento do Destino', pct: data!.alinhamentoDestino.pct, texto: data!.alinhamentoDestino.texto },
    { label: 'Sinergia de Talentos', pct: data!.sinergiaTalentos.pct, texto: data!.sinergiaTalentos.texto },
    { label: 'Fase da Vida', pct: data!.faseDaVida.pct, texto: data!.faseDaVida.texto }
  ];

  for (const secao of secoes) {
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(secao.texto, CONTENT_WIDTH - 40);
    const lineHeight = 6.5;
    const boxHeight = 60 + (lines.length * lineHeight) + 20;

    await addPageIfNeeded(pdf, pagination, boxHeight, 24);

    pdf.setFontSize(13);
    pdf.setTextColor(...COLORS.charcoal);
    pdf.setFont('helvetica', 'bold');
    pdf.text(secao.label, MARGIN + 20, pagination.currentY + 20);

    pdf.setFontSize(13);
    pdf.setTextColor(...COLORS.gold);
    pdf.text(`${secao.pct}%`, MARGIN + CONTENT_WIDTH - 40, pagination.currentY + 20);

    const barY = pagination.currentY + 28;
    pdf.setFillColor(...COLORS.line);
    pdf.roundedRect(MARGIN + 20, barY, CONTENT_WIDTH - 40, 6, 3, 3, 'F');
    const fillWidth = ((CONTENT_WIDTH - 40) * secao.pct) / 100;
    pdf.setFillColor(...COLORS.accentBlue);
    pdf.roundedRect(MARGIN + 20, barY, fillWidth, 6, 3, 3, 'F');

    pdf.setFontSize(10);
    pdf.setTextColor(...COLORS.ink);
    pdf.setFont('helvetica', 'normal');
    pdf.text(lines, MARGIN + 20, pagination.currentY + 44);

    advanceY(pagination, boxHeight, 24);
  }


  return true;
}

