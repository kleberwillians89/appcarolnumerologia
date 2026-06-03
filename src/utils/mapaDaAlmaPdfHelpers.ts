import jsPDF from 'jspdf';
import { PDF_IMG } from './pdfImageUrls';

// Paleta de cores (valores RGB)
export const COLORS = {
  charcoal: [24, 28, 34] as [number, number, number],
  gold: [201, 162, 39] as [number, number, number],
  ink: [43, 43, 43] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  panel: [250, 248, 242] as [number, number, number],
  line: [226, 219, 204] as [number, number, number],
  accentBlue: [58, 102, 255] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  darkBg: [18, 22, 28] as [number, number, number],
  pageBg: [252, 250, 245] as [number, number, number],
  softGold: [238, 226, 196] as [number, number, number],
};

// Dimensões A4 em pontos (1mm = 2.83465pt)
export const PAGE_WIDTH = 595;
export const PAGE_HEIGHT = 842;
export const MARGIN = 44;
export const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

interface PremiumPdfMeta {
  clientName: string;
  birthDate: string;
  issueDate: string;
  productName: string;
}

let premiumPdfMeta: PremiumPdfMeta = {
  clientName: '',
  birthDate: '',
  issueDate: '',
  productName: 'Mapa da Alma',
};

export const setPremiumPdfMeta = (meta: PremiumPdfMeta) => {
  premiumPdfMeta = meta;
};

// Funções auxiliares
export const addText = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    size?: number;
    color?: [number, number, number];
    font?: string;
    style?: string;
    maxWidth?: number;
    align?: 'left' | 'center' | 'right';
  } = {}
) => {
  const {
    size = 12,
    color = COLORS.ink,
    font = 'helvetica',
    style = 'normal',
    maxWidth,
    align = 'left',
  } = options;

  pdf.setFontSize(size);
  pdf.setTextColor(...color);
  pdf.setFont(font, style);

  if (maxWidth) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y, { align });
    return y + lines.length * (size * 0.4);
  }

  pdf.text(text, x, y, { align });
  return y + size * 0.4;
};

export const addBox = (
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fill?: [number, number, number];
    border?: [number, number, number];
    radius?: number;
  } = {}
) => {
  const { fill = COLORS.panel, border = COLORS.line, radius = 8 } = options;

  if (fill) {
    pdf.setFillColor(...fill);
    pdf.roundedRect(x, y, width, height, radius, radius, 'F');
  }

  if (border) {
    pdf.setDrawColor(...border);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(x, y, width, height, radius, radius, 'S');
  }
};

export const formatDatePtBr = (date: Date = new Date()) => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const createFriendlyFileName = (clientName: string, productName = 'Mapa da Alma') => {
  const slug = `${productName}-${clientName}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug || 'mapa-da-alma'}.pdf`;
};

export const addPremiumInteriorChrome = (pdf: jsPDF) => {
  const pageNumber = pdf.getNumberOfPages();

  pdf.setFillColor(...COLORS.pageBg);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  pdf.setFillColor(...COLORS.white);
  pdf.rect(0, 0, PAGE_WIDTH, 82, 'F');

  pdf.setDrawColor(...COLORS.softGold);
  pdf.setLineWidth(1);
  pdf.line(MARGIN, 82, PAGE_WIDTH - MARGIN, 82);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...COLORS.gold);
  pdf.text('CAROL GRABER NUMEROLOGIA', MARGIN, 38);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(premiumPdfMeta.productName, MARGIN, 54);

  const clientLabel = premiumPdfMeta.clientName
    ? `${premiumPdfMeta.clientName} - ${premiumPdfMeta.birthDate}`
    : premiumPdfMeta.issueDate;
  pdf.text(clientLabel, PAGE_WIDTH - MARGIN, 45, { align: 'right' });

  pdf.setFillColor(...COLORS.softGold);
  pdf.rect(0, PAGE_HEIGHT - 54, PAGE_WIDTH, 54, 'F');
  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(0.8);
  pdf.line(MARGIN, PAGE_HEIGHT - 54, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 54);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...COLORS.charcoal);
  pdf.text(`Emitido em ${premiumPdfMeta.issueDate}`, MARGIN, PAGE_HEIGHT - 25);
  pdf.text(`Pagina ${pageNumber}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 25, { align: 'right' });
};

export const renderPremiumSectionHeader = (
  pdf: jsPDF,
  title: string,
  subtitle?: string,
  y = 126
) => {
  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(2);
  pdf.line(MARGIN, y - 26, MARGIN + 54, y - 26);

  addText(pdf, title, PAGE_WIDTH / 2, y, {
    size: 24,
    color: COLORS.charcoal,
    font: 'helvetica',
    style: 'bold',
    align: 'center',
  });

  if (subtitle) {
    addText(pdf, subtitle, PAGE_WIDTH / 2, y + 18, {
      size: 10.5,
      color: COLORS.muted,
      font: 'helvetica',
      style: 'normal',
      align: 'center',
    });
  }
};

// Cache de imagens carregadas
const imageCache: { [key: string]: string } = {};

// Função para verificar se uma imagem existe
const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Função para carregar imagem com fallback .webp -> .png -> gradient
export const loadImageAsBase64 = async (imagePath: string): Promise<string | null> => {
  if (imageCache[imagePath]) {
    return imageCache[imagePath];
  }

  // Verificar se há imagem personalizada no localStorage
  const customImageKey = imagePath.split('/').pop()?.replace('.png', '').replace('.webp', '');
  const customImage = customImageKey ? localStorage.getItem(`custom_${customImageKey}`) : null;
  
  if (customImage) {
    console.log(`✅ Usando imagem personalizada para ${imagePath}`);
    imageCache[imagePath] = customImage;
    return customImage;
  }

  // Sistema de fallback: tenta .webp primeiro, depois .png, depois retorna null
  let finalPath = imagePath;
  
  try {
    // Se o caminho já tem .webp, tenta carregar
    if (imagePath.endsWith('.webp')) {
      const exists = await checkImageExists(imagePath);
      if (!exists) {
        // Tenta versão .png
        const pngPath = imagePath.replace('.webp', '.png');
        console.log(`⚠️ Imagem .webp não encontrada, tentando .png: ${pngPath}`);
        const pngExists = await checkImageExists(pngPath);
        if (pngExists) {
          finalPath = pngPath;
        } else {
          console.warn(`⚠️ Imagem não encontrada: ${imagePath} - usando fallback`);
          return null;
        }
      }
    } 
    // Se o caminho tem .png, tenta .webp primeiro
    else if (imagePath.endsWith('.png')) {
      const webpPath = imagePath.replace('.png', '.webp');
      const webpExists = await checkImageExists(webpPath);
      if (webpExists) {
        console.log(`✅ Usando versão .webp: ${webpPath}`);
        finalPath = webpPath;
      }
    }

    const response = await fetch(finalPath, { 
      mode: 'cors',
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Falha ao carregar imagem: ${finalPath} (Status: ${response.status}) - usando fallback`);
      return null;
    }
    
    const blob = await response.blob();
    
    if (blob.size === 0) {
      console.warn(`⚠️ Imagem vazia: ${finalPath} - usando fallback`);
      return null;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        imageCache[imagePath] = base64;
        console.log(`✅ Imagem carregada com sucesso: ${finalPath} (${(blob.size / 1024).toFixed(2)} KB)`);
        resolve(base64);
      };
      reader.onerror = () => {
        console.warn(`⚠️ Erro ao converter imagem para base64: ${finalPath} - usando fallback`);
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.warn(`⚠️ Erro ao carregar imagem ${finalPath}: ${errorMessage} - usando fallback`);
    return null;
  }
};







// Adicionar imagem de background à página
// Adicionar imagem de background à página
// Adicionar imagem de background à página com fallback para gradiente
export const addBackgroundImage = async (
  pdf: jsPDF,
  imagePath: string
) => {
  if (imagePath === PDF_IMG.BG) {
    addPremiumInteriorChrome(pdf);
    return;
  }

  try {
    console.log(`🖼️ Tentando carregar imagem: ${imagePath}`);
    const base64Image = await loadImageAsBase64(imagePath);
    
    if (!base64Image) {
      console.warn(`⚠️ Imagem não disponível, usando gradiente de fallback: ${imagePath}`);
      // Criar gradiente de fallback (roxo para dourado)
      pdf.setFillColor(88, 28, 135); // purple-900
      pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
      
      // Adicionar overlay semi-transparente
      pdf.setFillColor(30, 30, 30);
      pdf.setGState(new pdf.GState({ opacity: 0.3 }));
      pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
      pdf.setGState(new pdf.GState({ opacity: 1 }));
      return;
    }
    
    // Detectar formato da imagem a partir do data URI
    let format = 'PNG';
    if (base64Image.includes('data:image/webp')) {
      format = 'WEBP';
    } else if (base64Image.includes('data:image/jpeg') || base64Image.includes('data:image/jpg')) {
      format = 'JPEG';
    } else if (base64Image.includes('data:image/png')) {
      format = 'PNG';
    }
    
    console.log(`✅ Adicionando imagem ao PDF com formato: ${format}`);
    pdf.addImage(base64Image, format, 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    console.log(`✅ Imagem adicionada com sucesso: ${imagePath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.warn(`⚠️ Erro ao adicionar background ${imagePath}: ${errorMessage} - usando gradiente`);
    
    // Fallback para gradiente em caso de erro
    pdf.setFillColor(88, 28, 135);
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
    pdf.setFillColor(30, 30, 30);
    pdf.setGState(new pdf.GState({ opacity: 0.3 }));
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
  }
};

