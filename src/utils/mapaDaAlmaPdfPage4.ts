import jsPDF from 'jspdf';
import { CalendarioAnoPessoal } from './mapaDaAlmaPdfTypes';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { initPagination, addPageIfNeeded, advanceY } from './pdfAutoPagination';

export const renderCalendarioPage = async (pdf: jsPDF, data: CalendarioAnoPessoal) => {
  await addBackgroundImage(pdf, PDF_IMG.BG);

  const pagination = initPagination(MARGIN + 130, PDF_IMG.BG);

  addText(pdf, 'Calendário do Ano Pessoal', 297.5, pagination.currentY, { size: 24, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' });
  pagination.currentY += 18;

  addText(pdf, `Previsão Mensal para ${data.periodoLabel}`, 297.5, pagination.currentY, { size: 11, color: COLORS.muted, font: 'helvetica', style: 'normal', align: 'center' });
  pagination.currentY += 30;

  const cols = 3, gutter = 16;
  const cardWidth = (CONTENT_WIDTH - gutter * (cols - 1)) / cols;
  const lineHeight = 6.5;
  const headerHeight = 40;
  const bottomPadding = 16;


  for (let i = 0; i < 12; i++) {
    const col = i % cols;
    
    // Calcular altura dinâmica
    pdf.setFontSize(10.5);
    const lines = pdf.splitTextToSize(data.meses[i].texto, cardWidth - 24);
    const cardHeight = headerHeight + (lines.length * lineHeight) + bottomPadding;

    // Nova linha a cada 3 cards
    if (col === 0 && i > 0) {
      pagination.currentY += 18;
    }


    const x = MARGIN + col * (cardWidth + gutter);

    await addPageIfNeeded(pdf, pagination, cardHeight, 0);

    // Adicionar box ao redor do card
    addBox(pdf, x, pagination.currentY, cardWidth, cardHeight, { 
      fill: COLORS.panel, 
      border: COLORS.line, 
      radius: 8 
    });

    pdf.setFontSize(12.5);
    pdf.setTextColor(...COLORS.charcoal);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.meses[i].mesAno, x + 12, pagination.currentY + 20);

    pdf.setFontSize(10.5);
    pdf.setTextColor(...COLORS.ink);
    pdf.setFont('helvetica', 'normal');
    pdf.text(lines, x + 12, pagination.currentY + 38);


    // Avançar Y apenas no último card da linha
    if (col === 2) {
      advanceY(pagination, cardHeight, 0);
    }
  }

};
