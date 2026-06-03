import jsPDF from 'jspdf';
import { PAGE_HEIGHT, MARGIN, addBackgroundImage } from './mapaDaAlmaPdfHelpers';

/**
 * Sistema de paginação automática para PDF
 * Detecta quando conteúdo ultrapassa limite e cria nova página
 */

export interface PaginationContext {
  currentY: number;
  pageNumber: number;
  maxY: number;
  backgroundImage?: string;
}

// Área útil da página (descontando margens superior e inferior)
// Espaçamento padrão consistente entre blocos
export const DEFAULT_BLOCK_SPACING = 36;

// Espaçamento mínimo para evitar elementos muito próximos ao rodapé
const MIN_BOTTOM_MARGIN = 72;
const CONTINUATION_START_Y = 126;

/**
 * Inicializa contexto de paginação
 */
export const initPagination = (
  startY: number = MARGIN,
  backgroundImage?: string
): PaginationContext => ({
  currentY: startY,
  pageNumber: 1,
  maxY: PAGE_HEIGHT - MIN_BOTTOM_MARGIN,
  backgroundImage
});

/**
 * Verifica se um elemento cabe na página atual
 */
export const canFitInCurrentPage = (
  context: PaginationContext,
  elementHeight: number,
  spacing: number = DEFAULT_BLOCK_SPACING
): boolean => {
  return (context.currentY + elementHeight + spacing) <= context.maxY;
};

/**
 * Verifica se um bloco completo cabe na página atual
 * Usado para evitar quebras no meio de blocos de conteúdo
 */
export const canFitCompleteBlock = (
  context: PaginationContext,
  blockHeight: number
): boolean => {
  return (context.currentY + blockHeight) <= context.maxY;
};

/**
 * Adiciona nova página se necessário
 * Retorna true se nova página foi criada
 */
export const addPageIfNeeded = async (
  pdf: jsPDF,
  context: PaginationContext,
  elementHeight: number,
  spacing: number = DEFAULT_BLOCK_SPACING
): Promise<boolean> => {
  if (!canFitInCurrentPage(context, elementHeight, spacing)) {
    // Adicionar nova página
    pdf.addPage();
    context.pageNumber++;
    
    // Adicionar background se especificado
    if (context.backgroundImage) {
      await addBackgroundImage(pdf, context.backgroundImage);
    }
    
    // Resetar Y abaixo do cabeçalho premium.
    context.currentY = CONTINUATION_START_Y;
    
    return true;
  }
  
  return false;
};

/**
 * Adiciona nova página se bloco completo não couber
 * Garante que blocos não sejam cortados ao meio
 */
export const addPageForCompleteBlock = async (
  pdf: jsPDF,
  context: PaginationContext,
  blockHeight: number
): Promise<boolean> => {
  if (!canFitCompleteBlock(context, blockHeight)) {
    pdf.addPage();
    context.pageNumber++;
    
    if (context.backgroundImage) {
      await addBackgroundImage(pdf, context.backgroundImage);
    }
    
    context.currentY = CONTINUATION_START_Y;
    return true;
  }
  
  return false;
};

/**
 * Avança a posição Y após adicionar elemento
 */
export const advanceY = (
  context: PaginationContext,
  elementHeight: number,
  spacing: number = DEFAULT_BLOCK_SPACING
): void => {
  context.currentY += elementHeight + spacing;
};

/**
 * Garante espaço mínimo antes de adicionar elemento
 * Se não houver espaço suficiente, cria nova página
 */
export const ensureSpace = async (
  pdf: jsPDF,
  context: PaginationContext,
  requiredHeight: number
): Promise<void> => {
  await addPageForCompleteBlock(pdf, context, requiredHeight);
};
