import { generateMapaDaAlmaPDF } from './mapaDaAlmaPdfGenerator';
import { preloadPdfImages, PreloadProgress } from './imagePreloader';

/**
 * Gera PDF com pré-carregamento automático de imagens
 * @param data Dados do PDF
 * @param onProgress Callback opcional para mostrar progresso
 * @param previewMode Se deve retornar preview ao invés de download
 */
export const generatePdfWithPreload = async (
  data: any,
  onProgress?: (progress: PreloadProgress) => void,
  previewMode = false
) => {
  // Pré-carrega todas as imagens
  await preloadPdfImages(onProgress);
  
  // Pequeno delay para UI
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Gera o PDF
  return await generateMapaDaAlmaPDF(data, previewMode);
};
