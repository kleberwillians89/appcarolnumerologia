import jsPDF from 'jspdf';
import { CompatibilityResult } from './compatibilityCalculations';
import { deepCompatibilityAnalysis } from '../texts/compatibilityDeepAnalysis';
import { universalGrowthPractices } from '../texts/compatibilityRecommendations';
import { addCoverPage, addHeader, addFooter, PDF_FONTS, PDF_COLORS, PDF_MARGINS, addOptimizedText } from './pdfStandardHelpers';

export async function generateEnhancedCompatibilityPDF(
  result: CompatibilityResult,
  relationshipType: 'romantic' | 'business' | 'friendship'
) {
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
  const typeLabels = { romantic: 'Relacionamento Romântico', business: 'Parceria de Negócios', friendship: 'Amizade' };
  await addCoverPage(pdf, 'Compatibilidade Numerológica', typeLabels[relationshipType], `${result.person1.name} & ${result.person2.name}`);

  // Página 1: Visão Geral
  let y = addNewPage();
  
  pdf.setFontSize(PDF_FONTS.title.size);
  pdf.setTextColor(...PDF_COLORS.primary);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Visão Geral', PDF_MARGINS.left, y);
  y += 10;
  
  const overallScore = Math.round((result.scores.soul + result.scores.destiny + result.scores.talent) / 3);
  
  pdf.setFillColor(...PDF_COLORS.primary);
  pdf.roundedRect(PDF_MARGINS.left, y, contentWidth, 25, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(`Compatibilidade: ${overallScore}%`, pageWidth / 2, y + 15, { align: 'center' });
  y += 35;
  
  pdf.setTextColor(...PDF_COLORS.text);
  pdf.setFontSize(PDF_FONTS.body.size);
  pdf.text(`${result.person1.name}: Alma ${result.numbers.person1.soul} | Destino ${result.numbers.person1.destiny}`, PDF_MARGINS.left, y);
  y += 6;
  pdf.text(`${result.person2.name}: Alma ${result.numbers.person2.soul} | Destino ${result.numbers.person2.destiny}`, PDF_MARGINS.left, y);
  y += 15;

  // Análise Aprofundada
  const compatKey = `${result.numbers.person1.soul}-${result.numbers.person2.soul}`;
  const analysis = deepCompatibilityAnalysis[compatKey] || deepCompatibilityAnalysis['1-1'];
  
  pdf.setFontSize(PDF_FONTS.subtitle.size);
  pdf.setTextColor(...PDF_COLORS.primary);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Análise da Alma', PDF_MARGINS.left, y);
  y += 7;
  y = addOptimizedText(pdf, analysis.soulAnalysis, PDF_MARGINS.left, y, contentWidth);
  y += 8;
  
  if (y > pageHeight - 60) y = addNewPage();
  
  pdf.setFontSize(PDF_FONTS.subtitle.size);
  pdf.setTextColor(...PDF_COLORS.primary);
  pdf.text('Análise do Destino', PDF_MARGINS.left, y);
  y += 7;
  y = addOptimizedText(pdf, analysis.destinyAnalysis, PDF_MARGINS.left, y, contentWidth);
  
  // Página 2: Recomendações
  y = addNewPage();
  
  pdf.setFontSize(PDF_FONTS.title.size);
  pdf.setTextColor(...PDF_COLORS.primary);
  pdf.text('Recomendações', PDF_MARGINS.left, y);
  y += 10;
  
  analysis.recommendations.forEach((rec, idx) => {
    if (y > pageHeight - 40) y = addNewPage();
    pdf.setFontSize(PDF_FONTS.body.size);
    pdf.setTextColor(...PDF_COLORS.text);
    const text = `${idx + 1}. ${rec}`;
    y = addOptimizedText(pdf, text, PDF_MARGINS.left, y, contentWidth);
    y += 3;
  });

  // Página 3: Exercícios
  y = addNewPage();
  
  pdf.setFontSize(PDF_FONTS.title.size);
  pdf.setTextColor(...PDF_COLORS.primary);
  pdf.text('Exercícios Práticos', PDF_MARGINS.left, y);
  y += 10;
  
  analysis.practicalExercises.forEach((ex, idx) => {
    if (y > pageHeight - 50) y = addNewPage();
    pdf.setFontSize(PDF_FONTS.subtitle.size);
    pdf.setTextColor(...PDF_COLORS.gold);
    pdf.text(`Exercício ${idx + 1}`, PDF_MARGINS.left, y);
    y += 6;
    y = addOptimizedText(pdf, ex, PDF_MARGINS.left, y, contentWidth);
    y += 5;
  });

  pdf.save(`compatibilidade-${result.person1.name}-${result.person2.name}.pdf`);
  return true;
}
