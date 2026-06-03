import jsPDF from 'jspdf';
import { lifeCycleGeneralMeanings, lifeCyclesIntroText } from '../texts/lifeCycles';
import { challengeNumberInterpretations } from '../texts/challengeNumbers';
import { presentsIntroText, challengesIntroText } from '../texts/presentsAndChallenges';
import { presentNumberInterpretations } from '../texts/presents';

interface LifeJourneyData {
  cycles: any;
  challenges: any;
  presents: number[];
  userName: string;
  birthDate: string;
}

export const generateLifeJourneyPDF = async (data: LifeJourneyData) => {
  const { cycles, challenges, presents, userName, birthDate } = data;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // Cover Page
  pdf.setFillColor(147, 51, 234); // Purple
  pdf.rect(0, 0, pageWidth, 80, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.text('🌟 Jornada da Vida', pageWidth / 2, 35, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.text(userName, pageWidth / 2, 50, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(birthDate, pageWidth / 2, 65, { align: 'center' });

  pdf.setTextColor(0, 0, 0);
  yPos = 100;

  // Table of Contents
  pdf.setFontSize(18);
  pdf.setTextColor(147, 51, 234);
  pdf.text('Conteúdo', margin, yPos);
  yPos += 15;

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('1. Ciclos de Vida', margin + 5, yPos);
  yPos += 8;
  pdf.text('2. Desafios', margin + 5, yPos);
  yPos += 8;
  pdf.text('3. Presentes', margin + 5, yPos);

  // Page 2: Cycles
  pdf.addPage();
  yPos = 20;

  pdf.setFillColor(243, 232, 255);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setFontSize(22);
  pdf.setTextColor(147, 51, 234);
  pdf.text('🔄 Ciclos de Vida', pageWidth / 2, 25, { align: 'center' });

  pdf.setTextColor(0, 0, 0);
  yPos = 50;
  
  pdf.setFontSize(10);
  yPos = addText(lifeCyclesIntroText, margin, yPos, contentWidth, 10);
  yPos += 10;

  // First Cycle
  if (cycles?.first) {
    pdf.setFillColor(243, 232, 255);
    pdf.rect(margin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(147, 51, 234);
    pdf.text(`1º Ciclo (0-28 anos): Número ${cycles.first.value}`, margin, yPos + 2);
    yPos += 12;

    pdf.setFontSize(11);
    pdf.setTextColor(109, 40, 217);
    const title1 = lifeCycleGeneralMeanings[cycles.first.value]?.title || '';
    yPos = addText(title1, margin, yPos, contentWidth, 11);
    yPos += 2;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const desc1 = lifeCycleGeneralMeanings[cycles.first.value]?.description || '';
    yPos = addText(desc1, margin, yPos, contentWidth, 10);
    yPos += 10;
  }

  // Second Cycle
  if (cycles?.second && yPos < 250) {
    pdf.setFillColor(243, 232, 255);
    pdf.rect(margin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(147, 51, 234);
    pdf.text(`2º Ciclo (29-56 anos): Número ${cycles.second.value}`, margin, yPos + 2);
    yPos += 12;

    pdf.setFontSize(11);
    pdf.setTextColor(109, 40, 217);
    const title2 = lifeCycleGeneralMeanings[cycles.second.value]?.title || '';
    yPos = addText(title2, margin, yPos, contentWidth, 11);
    yPos += 2;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const desc2 = lifeCycleGeneralMeanings[cycles.second.value]?.description || '';
    yPos = addText(desc2, margin, yPos, contentWidth, 10);
    yPos += 10;
  }

  // Third Cycle (new page if needed)
  if (cycles?.third) {
    if (yPos > 230) {
      pdf.addPage();
      yPos = 20;
    }
    
    pdf.setFillColor(243, 232, 255);
    pdf.rect(margin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(147, 51, 234);
    pdf.text(`3º Ciclo (57+ anos): Número ${cycles.third.value}`, margin, yPos + 2);
    yPos += 12;

    pdf.setFontSize(11);
    pdf.setTextColor(109, 40, 217);
    const title3 = lifeCycleGeneralMeanings[cycles.third.value]?.title || '';
    yPos = addText(title3, margin, yPos, contentWidth, 11);
    yPos += 2;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const desc3 = lifeCycleGeneralMeanings[cycles.third.value]?.description || '';
    yPos = addText(desc3, margin, yPos, contentWidth, 10);
  }

  // Page 3: Challenges
  pdf.addPage();
  yPos = 20;

  pdf.setFillColor(255, 237, 213);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setFontSize(22);
  pdf.setTextColor(234, 88, 12);
  pdf.text('⚡ Desafios', pageWidth / 2, 25, { align: 'center' });

  pdf.setTextColor(0, 0, 0);
  yPos = 50;
  
  pdf.setFontSize(10);
  yPos = addText(challengesIntroText, margin, yPos, contentWidth, 10);
  yPos += 10;

  // First Challenge
  if (challenges?.first) {
    pdf.setFillColor(255, 237, 213);
    pdf.rect(margin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(234, 88, 12);
    pdf.text(`1º Desafio (0-28 anos): Número ${challenges.first.value}`, margin, yPos + 2);
    yPos += 12;

    pdf.setFontSize(11);
    pdf.setTextColor(194, 65, 12);
    const chTitle1 = challengeNumberInterpretations[challenges.first.value]?.title || '';
    yPos = addText(chTitle1, margin, yPos, contentWidth, 11);
    yPos += 2;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const chDesc1 = challengeNumberInterpretations[challenges.first.value]?.description || '';
    yPos = addText(chDesc1, margin, yPos, contentWidth, 10);
    yPos += 10;
  }

  // Second Challenge
  if (challenges?.second && yPos < 250) {
    pdf.setFillColor(255, 237, 213);
    pdf.rect(margin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(234, 88, 12);
    pdf.text(`2º Desafio (29-56 anos): Número ${challenges.second.value}`, margin, yPos + 2);
    yPos += 12;

    pdf.setFontSize(11);
    pdf.setTextColor(194, 65, 12);
    const chTitle2 = challengeNumberInterpretations[challenges.second.value]?.title || '';
    yPos = addText(chTitle2, margin, yPos, contentWidth, 11);
    yPos += 2;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const chDesc2 = challengeNumberInterpretations[challenges.second.value]?.description || '';
    yPos = addText(chDesc2, margin, yPos, contentWidth, 10);
    yPos += 10;
  }

  // Major Challenge (new page if needed)
  if (challenges?.major) {
    if (yPos > 230) {
      pdf.addPage();
      yPos = 20;
    }
    
    pdf.setFillColor(254, 226, 226);
    pdf.rect(margin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(185, 28, 28);
    pdf.text(`Desafio Maior (Vida toda): Número ${challenges.major.value}`, margin, yPos + 2);
    yPos += 12;

    pdf.setFontSize(11);
    pdf.setTextColor(153, 27, 27);
    const chTitleM = challengeNumberInterpretations[challenges.major.value]?.title || '';
    yPos = addText(chTitleM, margin, yPos, contentWidth, 11);
    yPos += 2;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const chDescM = challengeNumberInterpretations[challenges.major.value]?.description || '';
    yPos = addText(chDescM, margin, yPos, contentWidth, 10);
  }

  // Page 4: Presents
  pdf.addPage();
  yPos = 20;

  pdf.setFillColor(220, 252, 231);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setFontSize(22);
  pdf.setTextColor(22, 163, 74);
  pdf.text('🎁 Presentes', pageWidth / 2, 25, { align: 'center' });

  pdf.setTextColor(0, 0, 0);
  yPos = 50;
  
  pdf.setFontSize(10);
  yPos = addText(presentsIntroText, margin, yPos, contentWidth, 10);
  yPos += 10;

  // Presents
  const ranges = ['0-29 anos', '30-39 anos', '40-49 anos', '50+ anos'];
  presents.forEach((present, idx) => {
    if (yPos > 240) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFillColor(220, 252, 231);
    pdf.rect(margin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    pdf.setFontSize(14);
    pdf.setTextColor(22, 163, 74);
    pdf.text(`${idx + 1}º Presente (${ranges[idx]}): Número ${present}`, margin, yPos + 2);
    yPos += 12;

    pdf.setFontSize(11);
    pdf.setTextColor(21, 128, 61);
    const pTitle = presentNumberInterpretations[present]?.title || '';
    yPos = addText(pTitle, margin, yPos, contentWidth, 11);
    yPos += 2;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const pDesc = presentNumberInterpretations[present]?.description || '';
    yPos = addText(pDesc, margin, yPos, contentWidth, 10);
    yPos += 10;
  });

  const filename = `jornada-da-vida-${userName.replace(/\s+/g, '-')}.pdf`;
  pdf.save(filename);
  
  return true;
};
