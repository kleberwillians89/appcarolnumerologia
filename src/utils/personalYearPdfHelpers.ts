import jsPDF from 'jspdf';

export const addOpportunitiesPage = (pdf: jsPDF, opportunities: string[], themes: string[], challenges: string[]) => {
  pdf.addPage();
  const margin = 20;
  const pageWidth = 210;
  let yPos = 30;
  
  // Opportunities
  pdf.setFillColor(34, 197, 94); // Green
  pdf.rect(margin, yPos - 8, pageWidth - 2 * margin, 10, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text('Oportunidades', margin + 5, yPos - 2);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  yPos += 10;
  opportunities.forEach(opp => {
    const lines = pdf.splitTextToSize(`✓ ${opp}`, pageWidth - 2 * margin - 10);
    pdf.text(lines, margin + 5, yPos);
    yPos += lines.length * 5 + 2;
  });
  
  yPos += 10;
  
  // Themes
  pdf.setFillColor(59, 130, 246); // Blue
  pdf.rect(margin, yPos - 8, pageWidth - 2 * margin, 10, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text('Temas Principais', margin + 5, yPos - 2);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  yPos += 10;
  themes.forEach(theme => {
    pdf.text(`• ${theme}`, margin + 5, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Challenges
  pdf.setFillColor(249, 115, 22); // Orange
  pdf.rect(margin, yPos - 8, pageWidth - 2 * margin, 10, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text('Desafios', margin + 5, yPos - 2);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  yPos += 10;
  challenges.forEach(challenge => {
    const lines = pdf.splitTextToSize(`⚠ ${challenge}`, pageWidth - 2 * margin - 10);
    pdf.text(lines, margin + 5, yPos);
    yPos += lines.length * 5 + 2;
  });
};
