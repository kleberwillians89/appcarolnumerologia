import jsPDF from 'jspdf';
import { AnoPessoalData } from './mapaDaAlmaPdfTypes';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { initPagination, addPageIfNeeded, advanceY } from './pdfAutoPagination';

export const renderAnoPessoalPage = async (pdf: jsPDF, data: AnoPessoalData) => {
  await addBackgroundImage(pdf, PDF_IMG.BG);

  // Inicializar contexto de paginação
  const pagination = initPagination(MARGIN + 130, PDF_IMG.BG);


  const headerHeight = 90;
  
  // Verificar se header cabe
  await addPageIfNeeded(pdf, pagination, headerHeight, 24);

  pdf.setFontSize(52);
  pdf.setTextColor(...COLORS.charcoal);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.numero, MARGIN + 30, pagination.currentY + 55);

  pdf.setFontSize(18);
  pdf.setTextColor(...COLORS.ink);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Ano Pessoal ${data.numero}`, MARGIN + 85, pagination.currentY + 40);

  pdf.setFontSize(13);
  pdf.setTextColor(...COLORS.muted);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Seu ciclo de transformação e crescimento', MARGIN + 85, pagination.currentY + 60);

  advanceY(pagination, headerHeight, 24);

  // Timeline
  const timelineHeight = 50;
  await addPageIfNeeded(pdf, pagination, timelineHeight, 0);
  
  const timelineY = pagination.currentY;
  const nodeSpacing = CONTENT_WIDTH / 10;
  const nodeRadius = 8;

  pdf.setDrawColor(...COLORS.line);
  pdf.setLineWidth(2);
  pdf.line(MARGIN + nodeSpacing / 2, timelineY, MARGIN + CONTENT_WIDTH - nodeSpacing / 2, timelineY);

  for (let i = 0; i < 9; i++) {
    const nodeX = MARGIN + nodeSpacing / 2 + i * nodeSpacing;
    const isActive = data.timeline[i].destaque;
    pdf.setFillColor(...(isActive ? COLORS.gold : COLORS.white));
    pdf.circle(nodeX, timelineY, nodeRadius, 'FD');

    pdf.setFontSize(10);
    pdf.setTextColor(...(isActive ? COLORS.white : COLORS.charcoal));
    pdf.setFont('helvetica', 'bold');
    pdf.text((i + 1).toString(), nodeX, timelineY + 3.5, { align: 'center' });

    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.muted);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.timeline[i].label, nodeX, timelineY + 20, { align: 'center' });
  }

  advanceY(pagination, timelineHeight, 24);
  
  // Calcular altura dinâmica do texto de interpretação
  // Calcular altura dinâmica do texto de interpretação
  pdf.setFontSize(11.5);
  pdf.setTextColor(...COLORS.ink);
  pdf.setFont('helvetica', 'normal');
  const lines = pdf.splitTextToSize(data.interpretacaoCompleta, CONTENT_WIDTH - 40);
  const lineHeight = 6.5;
  const numLines = lines.length;
  const textHeight = 50 + (numLines * lineHeight);


  // Verificar se texto cabe
  await addPageIfNeeded(pdf, pagination, textHeight, 0);
  
  // Título
  addText(pdf, 'Interpretação Completa', MARGIN + 20, pagination.currentY + 20, { size: 18, color: COLORS.charcoal, font: 'helvetica', style: 'bold' });
  
  // Texto da interpretação
  pdf.setFontSize(11.5);
  pdf.setTextColor(...COLORS.ink);
  pdf.setFont('helvetica', 'normal');
  pdf.text(lines, MARGIN + 20, pagination.currentY + 40);
};
