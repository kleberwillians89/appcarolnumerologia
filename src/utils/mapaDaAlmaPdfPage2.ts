import jsPDF from 'jspdf';
import { NumeroItem } from './mapaDaAlmaPdfTypes';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';

export const renderNumerosPage = async (
  pdf: jsPDF,
  numeros: NumeroItem[],
  nome: string,
  dataNascimento: string
) => {
  await addBackgroundImage(pdf, PDF_IMG.BG);

  let y = MARGIN + 130;
  addText(pdf, 'Seu Mapa Numerológico', 297.5, y, { size: 26, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' });
  y += 18;

  const subtitle = `${nome} • ${dataNascimento}`;
  addText(pdf, subtitle, 297.5, y, { size: 11, color: COLORS.muted, font: 'helvetica', style: 'normal', align: 'center' });
  y += 30;

  const cardWidth = (CONTENT_WIDTH - 18) / 2;
  const cardHeight = 150;
  const gutter = 18;

  for (let i = 0; i < numeros.length && i < 6; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * (cardWidth + gutter);
    const cardY = y + row * (cardHeight + 16);

    addBox(pdf, x, cardY, cardWidth, cardHeight, { fill: COLORS.panel, border: COLORS.line, radius: 8 });

    pdf.setFillColor(...COLORS.gold);
    pdf.circle(x + 24, cardY + 24, 16, 'F');

    pdf.setFontSize(22);
    pdf.setTextColor(...COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(numeros[i].numero), x + 24, cardY + 30, { align: 'center' });



    pdf.setFontSize(13);
    pdf.setTextColor(...COLORS.charcoal);
    pdf.setFont('helvetica', 'bold');
    pdf.text(numeros[i].titulo, x + 48, cardY + 26);

    pdf.setFontSize(10.5);
    pdf.setTextColor(...COLORS.ink);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(numeros[i].texto, cardWidth - 32);
    pdf.text(lines, x + 16, cardY + 56);

  }
};
