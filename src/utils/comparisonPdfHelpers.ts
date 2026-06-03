import jsPDF from 'jspdf';
import { SavedProfile } from './profileStorage';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox } from './mapaDaAlmaPdfHelpers';

export const renderCompatibilityPage = async (pdf: jsPDF, profile1: SavedProfile, profile2: SavedProfile) => {
  let y = MARGIN + 130;
  addText(pdf, 'Análise de Compatibilidade', 297.5, y, { 
    size: 24, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' 
  });
};

export const renderCyclesComparison = async (pdf: jsPDF, profiles: SavedProfile[]) => {
  // Apenas renderiza ciclos do PRIMEIRO perfil (usuário principal)
  const mainProfile = profiles[0];
  let y = MARGIN + 130;
  addText(pdf, `${mainProfile.profileName || mainProfile.name} - Ciclos de Vida`, 297.5, y, { 
    size: 22, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' 
  });
};

export const renderChallengesComparison = async (pdf: jsPDF, profiles: SavedProfile[]) => {
  // Apenas renderiza desafios do PRIMEIRO perfil (usuário principal)
  const mainProfile = profiles[0];
  let y = MARGIN + 130;
  addText(pdf, `${mainProfile.profileName || mainProfile.name} - Desafios`, 297.5, y, { 
    size: 22, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' 
  });
};

export const renderChartPage = async (pdf: jsPDF, imageData: string, title: string) => {
  let y = MARGIN + 130;
  addText(pdf, title, 297.5, y, { 
    size: 22, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' 
  });
  y += 30;
  if (imageData) {
    pdf.addImage(imageData, 'PNG', MARGIN, y, CONTENT_WIDTH, 150);
  }
};
