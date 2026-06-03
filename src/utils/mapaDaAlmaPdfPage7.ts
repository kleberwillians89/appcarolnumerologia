import jsPDF from 'jspdf';
import { DesafiosCiclicosData } from './mapaDaAlmaPdfTypes';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { initPagination, addPageIfNeeded, advanceY } from './pdfAutoPagination';

export const renderDesafiosPage = async (pdf: jsPDF, data: DesafiosCiclicosData) => {
  await addBackgroundImage(pdf, PDF_IMG.BG);

  // Inicializar contexto de paginação
  const pagination = initPagination(MARGIN + 130, PDF_IMG.BG);

  addText(pdf, 'Desafios Cíclicos', 297.5, pagination.currentY, { size: 26, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' });
  pagination.currentY += 18;

  pdf.setFontSize(10.5);
  pdf.setTextColor(...COLORS.muted);
  pdf.setFont('helvetica', 'normal');
  const introLines = pdf.splitTextToSize(data.intro, CONTENT_WIDTH - 40);
  pdf.text(introLines, 297.5, pagination.currentY, { align: 'center' });
  pagination.currentY += introLines.length * 14 + 25;

  const lineHeight = 6.5; // Aumentado de 5 para 6.5
  const headerHeight = 66; // Aumentado de 56 para 66
  const bottomPadding = 24; // Aumentado de 16 para 24

  // Desafio 1 - Largura completa
  pdf.setFontSize(10.5);
  const lines1 = pdf.splitTextToSize(data.des1.texto, CONTENT_WIDTH - 70);
  const cardHeight1 = headerHeight + (lines1.length * lineHeight) + bottomPadding;

  await addPageIfNeeded(pdf, pagination, cardHeight1, 24);

  pdf.setFillColor(...COLORS.gold);
  pdf.circle(MARGIN + 28, pagination.currentY + 28, 18, 'F');
  pdf.setFontSize(24);
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.des1.numero, MARGIN + 28, pagination.currentY + 34, { align: 'center' });

  pdf.setFontSize(15);
  pdf.setTextColor(...COLORS.charcoal);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.des1.faixa, MARGIN + 54, pagination.currentY + 32);

  pdf.setFontSize(10.5);
  pdf.setTextColor(...COLORS.ink);
  pdf.setFont('helvetica', 'normal');
  pdf.text(lines1, MARGIN + 20, pagination.currentY + 56);

  advanceY(pagination, cardHeight1, 30);



  // Desafio 2 - Largura completa
  const lines2 = pdf.splitTextToSize(data.des2.texto, CONTENT_WIDTH - 70);
  const cardHeight2 = headerHeight + (lines2.length * lineHeight) + bottomPadding;

  await addPageIfNeeded(pdf, pagination, cardHeight2, 30);

  pdf.setFillColor(...COLORS.gold);
  pdf.circle(MARGIN + 28, pagination.currentY + 28, 18, 'F');
  pdf.setFontSize(24);
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.des2.numero, MARGIN + 28, pagination.currentY + 34, { align: 'center' });

  pdf.setFontSize(15);
  pdf.setTextColor(...COLORS.charcoal);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.des2.faixa, MARGIN + 54, pagination.currentY + 32);

  pdf.setFontSize(10.5);
  pdf.setTextColor(...COLORS.ink);
  pdf.setFont('helvetica', 'normal');
  pdf.text(lines2, MARGIN + 20, pagination.currentY + 56);

  advanceY(pagination, cardHeight2, 30);



  // Desafio Maior - Largura completa
  const linesMaior = pdf.splitTextToSize(data.desafioMaior.texto, CONTENT_WIDTH - 70);
  const maiorHeight = headerHeight + (linesMaior.length * lineHeight) + bottomPadding;

  await addPageIfNeeded(pdf, pagination, maiorHeight, 30);

  pdf.setFillColor(...COLORS.gold);
  pdf.circle(MARGIN + 28, pagination.currentY + 28, 18, 'F');
  pdf.setFontSize(24);
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.desafioMaior.numero, MARGIN + 28, pagination.currentY + 34, { align: 'center' });

  pdf.setFontSize(15);
  pdf.setTextColor(...COLORS.charcoal);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Desafio Maior', MARGIN + 54, pagination.currentY + 32);
  
  pdf.setFontSize(10.5);
  pdf.setTextColor(...COLORS.ink);
  pdf.setFont('helvetica', 'normal');
  pdf.text(linesMaior, MARGIN + 20, pagination.currentY + 56);
};
