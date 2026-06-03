import jsPDF from 'jspdf';
import { CicloData } from './mapaDaAlmaPdfTypes';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { initPagination, addPageIfNeeded, advanceY } from './pdfAutoPagination';

/**
 * Página 6 - Ciclos de Vida
 * Layout vertical com boxes de largura completa e altura dinâmica
 * Com paginação automática
 */
export const renderCiclosPage = async (
  pdf: jsPDF,
  ciclosInput: [CicloData, CicloData, CicloData] | CicloData[] | any
) => {
  await addBackgroundImage(pdf, PDF_IMG.BG);

  // Normalização defensiva de ciclos
  let ciclos: CicloData[] = [];
  if (Array.isArray(ciclosInput)) {
    ciclos = ciclosInput.filter(Boolean);
  } else if (ciclosInput && typeof ciclosInput === 'object') {
    ciclos = Object.values(ciclosInput).filter(Boolean) as CicloData[];
  }

  ciclos = ciclos.slice(0, 3);

  if (ciclos.length === 0) {
    ciclos = [
      { numero: '', titulo: '', texto: '', faixa: '0-28 anos' },
      { numero: '', titulo: '', texto: '', faixa: '29-56 anos' },
      { numero: '', titulo: '', texto: '', faixa: '57+ anos' }
    ];
  }

  // Inicializar contexto de paginação
  const pagination = initPagination(MARGIN + 120, PDF_IMG.BG);

  addText(pdf, 'Ciclos de Vida', 297.5, pagination.currentY, { size: 26, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' });
  pagination.currentY += 18;

  addText(pdf, 'As três grandes fases da sua jornada', 297.5, pagination.currentY, { size: 11, color: COLORS.muted, font: 'helvetica', style: 'normal', align: 'center' });
  pagination.currentY += 30;

  const lineHeight = 6.5;
  const headerHeight = 66;
  const bottomPadding = 24;


  for (const ciclo of ciclos) {
    // Calcula altura dinâmica baseada no texto
    pdf.setFontSize(10.5);
    const textLines = pdf.splitTextToSize(ciclo.texto || '', CONTENT_WIDTH - 70);
    const boxHeight = headerHeight + (textLines.length * lineHeight) + bottomPadding;

    // Verificar se precisa de nova página
    await addPageIfNeeded(pdf, pagination, boxHeight, 36);


    // Badge circular com número
    pdf.setFillColor(...COLORS.gold);
    pdf.circle(MARGIN + 28, pagination.currentY + 28, 18, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(...COLORS.white);
    pdf.text(String(ciclo.numero ?? ''), MARGIN + 28, pagination.currentY + 34, { align: 'center' });

    // Faixa etária e título
    pdf.setFontSize(15);
    pdf.setTextColor(...COLORS.charcoal);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ciclo.faixa || '', MARGIN + 54, pagination.currentY + 32);

    // Texto descritivo completo
    pdf.setFontSize(10.5);
    pdf.setTextColor(...COLORS.ink);
    pdf.setFont('helvetica', 'normal');
    pdf.text(textLines, MARGIN + 20, pagination.currentY + 56);

    // Avançar Y
    advanceY(pagination, boxHeight, 36);

  }

};
