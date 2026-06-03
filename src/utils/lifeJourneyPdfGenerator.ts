import jsPDF from 'jspdf';

interface LifeJourneyData {
  cycles: { first: { value: number }; second: { value: number }; third: { value: number } };
  challenges: { first: { value: number }; second: { value: number }; major: { value: number } };
  presents: number[];
  userName: string;
}

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const COLORS = { white: [255, 255, 255] as [number, number, number] };

// Load image with fallback to gradient
async function loadImageWithTimeout(path: string, timeout = 10000): Promise<string | null> {
  return new Promise(async (resolve) => {
    const timer = setTimeout(() => {
      console.warn(`⚠️ Timeout ao carregar imagem: ${path}`);
      resolve(null);
    }, timeout);

    try {
      const response = await fetch(path, { 
        mode: 'cors',
        cache: 'force-cache'
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Erro HTTP ${response.status} ao carregar: ${path}`);
        clearTimeout(timer);
        resolve(null);
        return;
      }
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        clearTimeout(timer);
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        console.warn(`⚠️ Erro ao ler imagem: ${path}`);
        clearTimeout(timer);
        resolve(null);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.warn(`⚠️ Erro ao carregar imagem ${path}:`, error);
      clearTimeout(timer);
      resolve(null);
    }
  });
}


export async function generateLifeJourneyPDF(data: LifeJourneyData) {
  try {
    console.log('🚀 Iniciando geração do PDF...');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Página 1: Capa com fallback para gradiente
    console.log('📄 Carregando capa...');
    const coverImg = await loadImageWithTimeout('/templates/pg1_capa.webp', 8000);
    
    if (coverImg) {
      pdf.addImage(coverImg, 'WEBP', 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM);
    } else {
      // Fallback: gradiente roxo
      console.log('⚠️ Usando gradiente de fallback para capa');
      pdf.setFillColor(88, 28, 135); // purple-900
      pdf.rect(0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, 'F');
    }
    
    pdf.setFontSize(24);
    pdf.setTextColor(...COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.userName, PAGE_WIDTH_MM / 2, PAGE_HEIGHT_MM - 40, { align: 'center' });
    
    // Página 2: Jornada com fallback
    console.log('📄 Carregando jornada...');
    pdf.addPage();
    const journeyImg = await loadImageWithTimeout('/templates/pg5_jornada.webp', 8000);
    
    if (journeyImg) {
      const format = journeyImg.includes('webp') ? 'WEBP' : 'PNG';
      pdf.addImage(journeyImg, format, 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM);
    } else {
      // Fallback: gradiente azul
      console.log('⚠️ Usando gradiente de fallback para jornada');
      pdf.setFillColor(59, 130, 246); // blue-500
      pdf.rect(0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, 'F');
    }
    
    console.log('✅ PDF gerado com sucesso!');
    pdf.save(`Jornada_da_Vida_${data.userName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('❌ Erro:', error);
    throw new Error('Falha ao gerar PDF. Verifique as imagens.');
  }
}

