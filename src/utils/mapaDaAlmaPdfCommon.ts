import jsPDF from 'jspdf';
import { COLORS, PAGE_WIDTH, PAGE_HEIGHT, MARGIN } from './mapaDaAlmaPdfHelpers';

/**
 * Componentes comuns do PDF Mapa da Alma
 * Nota: Este arquivo mantém funções legadas mas não são mais usadas no novo sistema
 * O novo sistema usa apenas backgrounds e conteúdo direto nas páginas
 */

// Função legada - não mais usada no novo sistema de 9 páginas
export const addHeaderFooter = async (
  pdf: jsPDF,
  pageNum: number,
  userName: string,
  addBackground: boolean = true
) => {
  // Esta função não é mais usada no novo sistema
  // Mantida apenas para compatibilidade com código legado
};

// Função legada - não mais usada no novo sistema de 9 páginas
export const addIndice = (pdf: jsPDF) => {
  // Esta função não é mais usada no novo sistema
  // Mantida apenas para compatibilidade com código legado
};
