import jsPDF from 'jspdf';

// Mantido apenas para utilidades de texto/cabeçalho em outros relatórios.
// As imagens definidas aqui NÃO são usadas no “Mapa da Alma”.
export const PDF_IMAGES = {
  header: '',
  cover: '',
  icons: [] as string[],
};

export const PDF_FONTS = {
  title: { size: 18, style: 'bold' as const },
  subtitle: { size: 13, style: 'bold' as const },
  body: { size: 9.5, style: 'normal' as const },
  small: { size: 8, style: 'normal' as const }
};

export const PDF_COLORS = {
  primary: [138, 43, 226] as [number, number, number],
  gold: [218, 165, 32] as [number, number, number],
  text: [40, 40, 40] as [number, number, number],
  lightBg: [250, 248, 255] as [number, number, number]
};

export const PDF_MARGINS = {
  top: 25,
  bottom: 20,
  left: 15,
  right: 15
};

// (demais helpers inalterados)
export const addCoverPage = async (doc: jsPDF, title: string, subtitle: string, userName: string) => { /* ...invariável... */ };
export const addHeader = (doc: jsPDF, pageNum: number) => { /* ...invariável... */ };
export const addFooter = (doc: jsPDF) => { /* ...invariável... */ };
export const addOptimizedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number => {
  doc.setFontSize(PDF_FONTS.body.size);
  doc.setTextColor(...PDF_COLORS.text);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * 4.5);
};
