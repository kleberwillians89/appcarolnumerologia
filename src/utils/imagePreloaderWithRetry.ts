import { loadImageAsBase64 } from './mapaDaAlmaPdfHelpers';

export interface PreloadProgress {
  current: number;
  total: number;
  currentImage: string;
  percentage: number;
  status: 'loading' | 'success' | 'error' | 'retrying';
  retryCount?: number;
}

export type ProgressCallback = (progress: PreloadProgress) => void;

export interface ImageLoadError {
  imagePath: string;
  error: Error;
  retryCount: number;
}

const PDF_IMAGES = [
  '/templates/pg1_capa.webp',
  '/templates/bg_2_Pdf.webp',
  '/templates/pg5_jornada.png'
];

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tenta carregar uma imagem com retry automático
 */
const loadImageWithRetry = async (
  imagePath: string,
  maxRetries: number = MAX_RETRIES,
  onProgress?: ProgressCallback,
  currentIndex?: number,
  total?: number
): Promise<string> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Notifica que está tentando novamente
        if (onProgress && currentIndex !== undefined && total !== undefined) {
          onProgress({
            current: currentIndex,
            total,
            currentImage: imagePath.split('/').pop() || imagePath,
            percentage: Math.round((currentIndex / total) * 100),
            status: 'retrying',
            retryCount: attempt
          });
        }
        
        // Aguarda antes de tentar novamente
        await delay(RETRY_DELAY * attempt);
        console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries + 1} para ${imagePath}`);
      }
      
      const result = await loadImageAsBase64(imagePath);
      
      if (!result) {
        throw new Error('Imagem retornou vazia');
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Tentativa ${attempt + 1} falhou para ${imagePath}:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(
          `Falha ao carregar ${imagePath} após ${maxRetries + 1} tentativas: ${lastError.message}`
        );
      }
    }
  }
  
  throw lastError || new Error('Erro desconhecido ao carregar imagem');
};

/**
 * Pré-carrega todas as imagens com retry automático e progresso detalhado
 */
export const preloadPdfImagesWithRetry = async (
  onProgress?: ProgressCallback
): Promise<{ success: boolean; errors: ImageLoadError[] }> => {
  const total = PDF_IMAGES.length;
  const errors: ImageLoadError[] = [];
  let current = 0;

  console.log(`🔄 Iniciando pré-carregamento de ${total} imagens com retry...`);

  for (const imagePath of PDF_IMAGES) {
    const fileName = imagePath.split('/').pop() || imagePath;
    
    try {
      // Atualiza progresso - carregando
      if (onProgress) {
        onProgress({
          current,
          total,
          currentImage: fileName,
          percentage: Math.round((current / total) * 100),
          status: 'loading'
        });
      }

      // Tenta carregar com retry
      await loadImageWithRetry(imagePath, MAX_RETRIES, onProgress, current, total);
      
      current++;
      
      // Atualiza progresso - sucesso
      if (onProgress) {
        onProgress({
          current,
          total,
          currentImage: fileName,
          percentage: Math.round((current / total) * 100),
          status: 'success'
        });
      }

      console.log(`✅ [${current}/${total}] ${fileName} carregada com sucesso`);
    } catch (error) {
      console.error(`❌ Falha definitiva ao carregar ${imagePath}:`, error);
      
      errors.push({
        imagePath,
        error: error as Error,
        retryCount: MAX_RETRIES
      });
      
      current++;
      
      // Atualiza progresso - erro
      if (onProgress) {
        onProgress({
          current,
          total,
          currentImage: fileName,
          percentage: Math.round((current / total) * 100),
          status: 'error'
        });
      }
    }
  }

  const success = errors.length === 0;
  
  if (success) {
    console.log(`✅ Pré-carregamento concluído com sucesso: ${current}/${total} imagens`);
  } else {
    console.warn(`⚠️ Pré-carregamento concluído com erros: ${errors.length}/${total} falharam`);
  }

  return { success, errors };
};

/**
 * Valida se todas as imagens estão acessíveis
 */
export const validatePdfImages = async (): Promise<{
  valid: boolean;
  missing: string[];
}> => {
  const missing: string[] = [];
  
  for (const imagePath of PDF_IMAGES) {
    try {
      const response = await fetch(imagePath, { method: 'HEAD' });
      if (!response.ok) {
        missing.push(imagePath);
      }
    } catch {
      missing.push(imagePath);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
};
