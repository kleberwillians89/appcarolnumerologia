import jsPDF from 'jspdf';
import { NumerologyResult } from './numerologyCalculations';
import { calculateLifeCycles, calculateChallenges, calculatePresents } from './numerologyCalculations2';
import { addCoverPage, addHeader, addFooter, PDF_FONTS, PDF_COLORS, PDF_MARGINS, addOptimizedText } from './pdfStandardHelpers';
import { soulNumberInterpretations, destinyNumberInterpretations, domNumberInterpretations, talentNumberInterpretations, dreamNumberInterpretations, challengeNumberInterpretations } from '../texts';
import { presentNumberInterpretations } from '../texts/presents';

export const generateOptimizedPDF = async (result: NumerologyResult, name: string, birthDate: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 2 * PDF_MARGINS.left;
  let pageNum = 0;

  const addNewPage = () => {
    pdf.addPage();
    pageNum++;
    addHeader(pdf, pageNum);
    addFooter(pdf);
    return PDF_MARGINS.top + 5;
  };

  // Capa
  await addCoverPage(pdf, 'Mapa Numerológico', 'Análise Completa', name);

  // Página 1: Números Principais
  let y = addNewPage();
  
  pdf.setFontSize(PDF_FONTS.title.size);
  pdf.setTextColor(...PDF_COLORS.primary);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Seus Números Principais', PDF_MARGINS.left, y);
  y += 12;

  const numbers = [
    { num: result.soul, title: 'Alma', interp: soulNumberInterpretations },
    { num: result.dom, title: 'Dom', interp: domNumberInterpretations },
    { num: result.destiny, title: 'Destino', interp: destinyNumberInterpretations },
    { num: result.talent, title: 'Talento', interp: talentNumberInterpretations },
    { num: result.dream, title: 'Sonho', interp: dreamNumberInterpretations }
  ];

  numbers.forEach(({ num, title, interp }) => {
    if (y > pageHeight - 70) y = addNewPage();
    
    pdf.setFillColor(...PDF_COLORS.lightBg);
    pdf.roundedRect(PDF_MARGINS.left, y, contentWidth, 8, 2, 2, 'F');
    
    pdf.setFontSize(PDF_FONTS.subtitle.size);
    pdf.setTextColor(...PDF_COLORS.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${title}: ${num}`, PDF_MARGINS.left + 3, y + 6);
    y += 12;
    
    const desc = interp[num]?.description || '';
    const shortDesc = desc.substring(0, 250) + '...';
    y = addOptimizedText(pdf, shortDesc, PDF_MARGINS.left, y, contentWidth);
    y += 8;
  });

  // Página 2: Desafio Maior
  const [year, month, day] = birthDate.split('-').map(Number);
  const challenges = calculateChallenges(day, month, year);
  
  y = addNewPage();
  
  pdf.setFontSize(PDF_FONTS.title.size);
  pdf.setTextColor(...PDF_COLORS.primary);
  pdf.text('Desafio Maior', PDF_MARGINS.left, y);
  y += 12;
  
  pdf.setFillColor(...PDF_COLORS.lightBg);
  pdf.roundedRect(PDF_MARGINS.left, y, contentWidth, 8, 2, 2, 'F');
  pdf.setFontSize(PDF_FONTS.subtitle.size);
  pdf.text(`Número: ${challenges.major.value}`, PDF_MARGINS.left + 3, y + 6);
  y += 12;
  
  const challengeDesc = challengeNumberInterpretations[challenges.major.value]?.description || '';
  y = addOptimizedText(pdf, challengeDesc, PDF_MARGINS.left, y, contentWidth);

  pdf.save(`mapa-numerologico-${name.replace(/\s+/g, '-')}.pdf`);
  return true;
};
