import jsPDF from 'jspdf';
import { personalYearInterpretations } from '../texts/personalYear';
import { addCoverPage, addHeader, addFooter, PDF_FONTS, PDF_COLORS, PDF_MARGINS, addOptimizedText } from './pdfStandardHelpers';

const yearColors: { [key: number]: [number, number, number] } = {
  1: [239, 68, 68], 2: [251, 146, 60], 3: [234, 179, 8],
  4: [34, 197, 94], 5: [20, 184, 166], 6: [59, 130, 246],
  7: [99, 102, 241], 8: [168, 85, 247], 9: [236, 72, 153]
};

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const generateEnhancedPDF = async (py: number, bm: number, d: string, m: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const interp = personalYearInterpretations[py];
  const currentYear = new Date().getFullYear();
  
  // Capa
  await addCoverPage(pdf, 'Previsão do Ano Pessoal', `Ano ${currentYear}`, m);
  
  // Página 1: Ano Pessoal
  pdf.addPage();
  addHeader(pdf, 1);
  addFooter(pdf);
  
  const c = yearColors[py];
  pdf.setFillColor(...c);
  pdf.rect(PDF_MARGINS.left, 30, pageWidth - 2 * PDF_MARGINS.left, 35, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(45);
  pdf.text(py.toString(), pageWidth / 2, 52, { align: 'center' });
  pdf.setFontSize(PDF_FONTS.subtitle.size);
  pdf.text(interp?.title || '', pageWidth / 2, 62, { align: 'center' });
  
  let y = 75;
  y = addOptimizedText(pdf, interp?.description || '', PDF_MARGINS.left, y, pageWidth - 2 * PDF_MARGINS.left);
  
  // Página 2: Previsão Mensal
  pdf.addPage();
  addHeader(pdf, 2);
  addFooter(pdf);
  
  pdf.setFillColor(...PDF_COLORS.primary);
  pdf.rect(0, 25, pageWidth, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(PDF_FONTS.title.size);
  pdf.text('Previsão Mensal', pageWidth / 2, 35, { align: 'center' });
  
  pdf.setTextColor(...PDF_COLORS.text);
  pdf.setFontSize(PDF_FONTS.body.size);
  y = 50;
  
  // Calcular o ano de início do ciclo atual (último aniversário)
  const currentMonth = new Date().getMonth() + 1;
  const startYear = currentMonth >= bm ? currentYear : currentYear - 1;
  
  for (let i = 0; i < 12; i++) {
    const mx = PDF_MARGINS.left + (i % 3) * 60;
    const my = y + Math.floor(i / 3) * 22;
    
    pdf.setFillColor(245, 245, 250);
    pdf.rect(mx, my, 55, 18, 'F');
    pdf.setDrawColor(...PDF_COLORS.gold);
    pdf.rect(mx, my, 55, 18, 'S');
    
    const monthIndex = ((bm - 1 + i) % 12);
    const yearOffset = Math.floor((bm - 1 + i) / 12);
    const displayYear = startYear + yearOffset;
    
    pdf.setFontSize(PDF_FONTS.subtitle.size - 2);
    pdf.setTextColor(...PDF_COLORS.primary);
    pdf.text(`${months[monthIndex]}/${displayYear}`, mx + 3, my + 6);
    
    pdf.setFontSize(PDF_FONTS.small.size);
    pdf.setTextColor(...PDF_COLORS.text);
    pdf.text(`Mês ${i + 1}`, mx + 3, my + 12);
  }

  
  pdf.save(`previsao-ano-pessoal-${py}-${currentYear}.pdf`);
  return true;
};
