import { loadImageAsBase64 } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';

export interface PreloadProgress {
  current: number;
  total: number;
  currentImage: string;
  percentage: number;
}

export type ProgressCallback = (progress: PreloadProgress) => void;

/** Lista de todas as imagens usadas no PDF Mapa da Alma */
const PDF_IMAGES = [PDF_IMG.CAPA, PDF_IMG.BG, PDF_IMG.JORNADA];

/** Pré-carrega todas as imagens necessárias para o PDF */
export const preloadPdfImages = async (
  onProgress?: ProgressCallback
): Promise<void> => {
  const total = PDF_IMAGES.length;
  let current = 0;

  for (const imagePath of PDF_IMAGES) {
    try {
      const fileName = imagePath.split('/').pop() || imagePath;

      onProgress?.({
        current,
        total,
        currentImage: fileName,
        percentage: Math.round((current / total) * 100),
      });

      await loadImageAsBase64(imagePath);
      current++;

      onProgress?.({
        current,
        total,
        currentImage: fileName,
        percentage: Math.round((current / total) * 100),
      });
    } catch {
      current++;
    }
  }
};

export const areImagesPreloaded = (): boolean => false;
