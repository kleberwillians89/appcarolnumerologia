import jsPDF from 'jspdf';
import { personalYearInterpretations } from '../texts/personalYear';

const yearColors: { [key: number]: [number, number, number] } = {
  1: [239, 68, 68], 2: [251, 146, 60], 3: [234, 179, 8],
  4: [34, 197, 94], 5: [20, 184, 166], 6: [59, 130, 246],
  7: [99, 102, 241], 8: [168, 85, 247], 9: [236, 72, 153]
};

const getMonthlyData = (year: number, month: number): string => {
  const guidance: { [key: string]: string } = {
    '1-1': 'Mês perfeito para iniciar projetos. Sua energia está no auge!',
    '1-2': 'Foque em parcerias que apoiem seus novos começos.',
    '2-1': 'Inicie o ano fortalecendo vínculos importantes.',
    '2-2': 'Mês de alta sensibilidade - pratique autocuidado.',
    '3-1': 'Comunique suas ideias com entusiasmo!',
    '3-2': 'Colaborações criativas trazem resultados.',
    '4-1': 'Estabeleça metas claras e planos de ação.',
    '4-2': 'Trabalhe em equipe com disciplina.',
    '5-1': 'Abra-se para mudanças e novidades!',
    '5-2': 'Parcerias trazem oportunidades de mudança.',
    '6-1': 'Priorize família e lar desde o início.',
    '6-2': 'Fortaleça vínculos familiares com amor.',
    '7-1': 'Inicie ano com introspecção e estudo.',
    '7-2': 'Parcerias espirituais enriquecem jornada.',
    '8-1': 'Estabeleça metas financeiras ambiciosas.',
    '8-2': 'Parcerias de negócios prosperam.',
    '9-1': 'Libere o passado desde o início.',
    '9-2': 'Encerre parcerias que não servem mais.'
  };
  return guidance[`${year}-${month}`] || 'Mês de crescimento.';
};

export const generatePersonalYearPDF = async (
  personalYear: number, birthMonth: number, day: string, month: string
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const interpretation = personalYearInterpretations[personalYear];
  const color = yearColors[personalYear];
  
  // Page 1: Header with color
  pdf.setFillColor(...color);
  pdf.rect(0, 0, 210, 80, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(60);
  pdf.text(personalYear.toString(), 105, 45, { align: 'center' });
  pdf.setFontSize(24);
  pdf.text(interpretation?.title || '', 105, 65, { align: 'center' });
  
  // Timeline visual
  pdf.setDrawColor(200);
  pdf.setLineWidth(2);
  pdf.line(20, 100, 190, 100);
  
  for (let i = 1; i <= 9; i++) {
    const x = 20 + (i - 1) * 18.89;
    const c = yearColors[i];
    pdf.setFillColor(...c);
    if (i === personalYear) {
      pdf.circle(x, 100, 8, 'F');
      pdf.setTextColor(...c);
      pdf.setFontSize(10);
      pdf.text('VOCÊ', x, 115, { align: 'center' });
    } else {
      pdf.circle(x, 100, 5, 'F');
    }
    pdf.setTextColor(0);
    pdf.setFontSize(12);
    pdf.text(i.toString(), x, 92, { align: 'center' });
  }
  
  // Description
  pdf.setTextColor(0);
  pdf.setFontSize(10);
  const lines = pdf.splitTextToSize(interpretation?.description || '', 170);
  pdf.text(lines, 20, 130);
  
  pdf.save(`ano-pessoal-${personalYear}.pdf`);
  return true;
};
