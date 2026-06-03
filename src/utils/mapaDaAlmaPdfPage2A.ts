import jsPDF from 'jspdf';
import { NumeroItem } from './mapaDaAlmaPdfTypes';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { initPagination, addPageIfNeeded, advanceY } from './pdfAutoPagination';

export const renderNumerosPageA = async (
  pdf: jsPDF,
  numeros: NumeroItem[],
  nome: string,
  dataNascimento: string
) => {
  await addBackgroundImage(pdf, PDF_IMG.BG);

  // Inicializar contexto de paginação
  const pagination = initPagination(MARGIN + 130, PDF_IMG.BG);

  addText(pdf, 'Números Essenciais', 297.5, pagination.currentY, { size: 26, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' });
  pagination.currentY += 18;

  const subtitle = `${nome} • ${dataNascimento}`;
  addText(pdf, subtitle, 297.5, pagination.currentY, { size: 11, color: COLORS.muted, font: 'helvetica', style: 'normal', align: 'center' });
  pagination.currentY += 30;


  // Renderizar os 3 primeiros números: Alma, Destino, Talento
  const numerosToRender = numeros.slice(0, 3);
  
  for (let i = 0; i < numerosToRender.length; i++) {
    const numero = numerosToRender[i];
    
    // Calcular altura dinâmica baseada no texto
    pdf.setFontSize(10.5);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(numero.texto, CONTENT_WIDTH - 32);
    const lineHeight = 6.5;
    const textHeight = lines.length * lineHeight;
    const boxHeight = 66 + textHeight + 24;

    // Verificar se precisa de nova página
    await addPageIfNeeded(pdf, pagination, boxHeight, 24);


    // Círculo com número
    pdf.setFillColor(...COLORS.gold);
    pdf.circle(MARGIN + 24, pagination.currentY + 24, 16, 'F');

    pdf.setFontSize(22);
    pdf.setTextColor(...COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(numero.numero), MARGIN + 24, pagination.currentY + 30, { align: 'center' });

    // Título
    pdf.setFontSize(13);
    pdf.setTextColor(...COLORS.charcoal);
    pdf.setFont('helvetica', 'bold');
    pdf.text(numero.titulo, MARGIN + 48, pagination.currentY + 26);

    // Texto
    pdf.setFontSize(10.5);
    pdf.setTextColor(...COLORS.ink);
    pdf.setFont('helvetica', 'normal');
    pdf.text(lines, MARGIN + 16, pagination.currentY + 56);

    // Avançar Y
    advanceY(pagination, boxHeight, 24);

  }

};

