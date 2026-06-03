import jsPDF from 'jspdf';
import { SavedProfile } from './profileStorage';
import { COLORS, MARGIN, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { captureMatrixAsImage } from './matrixImageCapture';


export const generateMultiProfilePDF = async (profiles: SavedProfile[]): Promise<void> => {
  // Validação robusta
  if (!profiles || !Array.isArray(profiles)) {
    throw new Error('Parâmetro profiles inválido');
  }
  
  if (profiles.length < 2) {
    throw new Error('É necessário pelo menos 2 perfis para comparar');
  }

  // Validar dados de cada perfil
  for (const profile of profiles) {
    if (!profile.results || !profile.name || !profile.birthDate) {
      throw new Error(`Perfil "${profile.profileName || 'sem nome'}" possui dados incompletos`);
    }
  }

  const pdf = new jsPDF();
  await addBackgroundImage(pdf, PDF_IMG.CAPA);
  
  addText(pdf, 'Comparação Múltipla de Perfis', 297.5, 160, { 
    size: 24, color: COLORS.gold, style: 'bold', align: 'center' 
  });
  
  addText(pdf, `${profiles.length} perfis comparados`, 297.5, 180, { 
    size: 14, color: COLORS.muted, align: 'center' 
  });

  const numbers = ['soul', 'destiny', 'dom', 'talent', 'dream'];
  const labels = ['Alma', 'Destino', 'Dom', 'Talento', 'Sonho'];
  
  const profilesPerPage = 3;
  const totalPages = Math.ceil(profiles.length / profilesPerPage);
  
  for (let page = 0; page < totalPages; page++) {
    pdf.addPage();
    await addBackgroundImage(pdf, PDF_IMG.BG);
    
    const startIdx = page * profilesPerPage;
    const pageProfiles = profiles.slice(startIdx, startIdx + profilesPerPage);
    
    let y = MARGIN + 140;
    addText(pdf, `Página ${page + 1} de ${totalPages}`, 297.5, y, { 
      size: 16, color: COLORS.gold, style: 'bold', align: 'center' 
    });
    y += 30;
    
    renderProfileTable(pdf, pageProfiles, numbers, labels, y);
  }

  // Adicionar Matriz de Similaridade (se 3+ perfis)
  if (profiles.length >= 3) {
    console.log('📊 Capturando matriz de similaridade para PDF múltiplo...');
    try {
      const matrixImage = await captureMatrixAsImage('similarity-matrix-export');
      pdf.addPage();
      await addBackgroundImage(pdf, PDF_IMG.BG);
      
      addText(pdf, 'Matriz de Similaridade', 297.5, MARGIN + 140, { 
        size: 20, color: COLORS.gold, style: 'bold', align: 'center' 
      });
      
      const imgWidth = 160;
      const imgHeight = 120;
      const x = (595 - imgWidth) / 2;
      const y = MARGIN + 170;
      
      pdf.addImage(matrixImage, 'PNG', x, y, imgWidth, imgHeight);
      console.log('✅ Matriz de similaridade adicionada ao PDF múltiplo');
    } catch (matrixError) {
      console.warn('⚠️ Erro ao capturar matriz, continuando sem ela:', matrixError);
    }
  }
  
  pdf.save(`comparacao-${profiles.length}-perfis-${Date.now()}.pdf`);

};

function renderProfileTable(pdf: jsPDF, profiles: SavedProfile[], numbers: string[], labels: string[], startY: number) {
  const colWidth = 50;
  const rowHeight = 25;
  let y = startY;
  
  profiles.forEach((p, idx) => {
    const x = MARGIN + 20 + idx * (colWidth + 10);
    addText(pdf, p.profileName.substring(0, 12), x + colWidth/2, y, { 
      size: 10, color: COLORS.white, style: 'bold', align: 'center' 
    });
  });
  
  y += 20;
  
  numbers.forEach((num, i) => {
    addText(pdf, labels[i], MARGIN + 10, y + rowHeight/2 + 3, { 
      size: 10, color: COLORS.white, style: 'bold' 
    });
    
    profiles.forEach((p, idx) => {
      const x = MARGIN + 20 + idx * (colWidth + 10);
      const value = p.results?.[num as keyof typeof p.results] || '-';
      
      addBox(pdf, x, y, colWidth, rowHeight, { fill: COLORS.panel, border: COLORS.line });
      addText(pdf, String(value), x + colWidth/2, y + rowHeight/2 + 3, { 
        size: 14, color: COLORS.gold, style: 'bold', align: 'center' 
      });
    });
    
    y += rowHeight + 5;
  });
}
