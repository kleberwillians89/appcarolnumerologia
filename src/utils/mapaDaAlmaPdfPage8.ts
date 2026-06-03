import jsPDF from 'jspdf';
import { PresentesData } from './mapaDaAlmaPdfTypes';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { initPagination, addPageIfNeeded, advanceY } from './pdfAutoPagination';

/**
 * Página 8 - Presentes da Vida
 * Layout vertical com boxes de largura completa e altura dinâmica
 * Com paginação automática
 */
export const renderPresentesPage = async (pdf: jsPDF, data: PresentesData) => {
  await addBackgroundImage(pdf, PDF_IMG.BG);

  // Inicializar contexto de paginação
  const pagination = initPagination(MARGIN + 130, PDF_IMG.BG);

  addText(pdf, 'Presentes da Vida', 297.5, pagination.currentY, { size: 26, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' });
  pagination.currentY += 12; // Reduzido de 18 para 12

  pdf.setFontSize(10.5);
  pdf.setTextColor(...COLORS.muted);
  pdf.setFont('helvetica', 'normal');
  const introLines = pdf.splitTextToSize(data.intro, CONTENT_WIDTH - 40);
  pdf.text(introLines, 297.5, pagination.currentY, { align: 'center' });
  pagination.currentY += introLines.length * 12 + 18; // Reduzido de 14 + 25 para 12 + 18

  const presentes = [data.p1, data.p2, data.p3, data.p4];
  const lineHeight = 5.5; // Reduzido de 6.5 para 5.5
  const headerHeight = 56; // Reduzido de 66 para 56
  const bottomPadding = 16; // Reduzido de 24 para 16



  for (const presente of presentes) {
    // Calcular altura dinâmica baseada no texto
    pdf.setFontSize(10.5);
    const lines = pdf.splitTextToSize(presente.texto, CONTENT_WIDTH - 70);
    const cardHeight = headerHeight + (lines.length * lineHeight) + bottomPadding;

    // Verificar se precisa de nova página
    await addPageIfNeeded(pdf, pagination, cardHeight, 36);



    // Badge circular com número
    pdf.setFillColor(...COLORS.gold);
    pdf.circle(MARGIN + 28, pagination.currentY + 28, 18, 'F');

    pdf.setFontSize(24);
    pdf.setTextColor(...COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.text(presente.numero, MARGIN + 28, pagination.currentY + 34, { align: 'center' });

    // Faixa etária
    pdf.setFontSize(15);
    pdf.setTextColor(...COLORS.charcoal);
    pdf.setFont('helvetica', 'bold');
    pdf.text(presente.faixa, MARGIN + 54, pagination.currentY + 32);

    // Texto descritivo
    pdf.setFontSize(10.5);
    pdf.setTextColor(...COLORS.ink);
    pdf.setFont('helvetica', 'normal');
    pdf.text(lines, MARGIN + 20, pagination.currentY + 56);

    // Avançar Y
    advanceY(pagination, cardHeight, 24); // Reduzido de 36 para 24



  }

};
