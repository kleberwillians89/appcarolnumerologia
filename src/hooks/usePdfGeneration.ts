import { useState, useCallback } from 'react';
import { PdfError } from '../components/PdfErrorModal';
import { preloadPdfImagesWithRetry, PreloadProgress } from '../utils/imagePreloaderWithRetry';

export const usePdfGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<PreloadProgress | null>(null);
  const [error, setError] = useState<PdfError | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleProgress = useCallback((prog: PreloadProgress) => {
    setProgress(prog);
  }, []);

  const generatePdf = useCallback(async (
    generatorFn: () => Promise<void>,
    options?: { skipPreload?: boolean }
  ) => {
    setIsGenerating(true);
    setError(null);
    setProgress(null);
    setShowErrorModal(false);

    try {
      // Pré-carrega imagens com retry se não for pulado
      if (!options?.skipPreload) {
        console.log('🔄 Pré-carregando imagens...');
        const preloadResult = await preloadPdfImagesWithRetry(handleProgress);
        
        if (!preloadResult.success) {
          const failedImages = preloadResult.errors.map(e => e.imagePath);
          throw {
            type: 'image_load',
            message: 'Falha ao carregar imagens necessárias para o PDF',
            details: `${failedImages.length} imagem(ns) não puderam ser carregadas após múltiplas tentativas`,
            failedImages,
            retryCount: 3
          } as PdfError;
        }
      }

      // Executa a função de geração do PDF
      console.log('📄 Gerando PDF...');
      await generatorFn();
      
      console.log('✅ PDF gerado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao gerar PDF:', err);
      
      // Determina o tipo de erro
      let pdfError: PdfError;
      
      if (err.type) {
        // Já é um PdfError
        pdfError = err;
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        pdfError = {
          type: 'network',
          message: 'Erro de conexão ao carregar recursos',
          details: err.message
        };
      } else if (err.message?.includes('imagem') || err.message?.includes('image')) {
        pdfError = {
          type: 'image_load',
          message: 'Erro ao carregar imagens do PDF',
          details: err.message
        };
      } else if (err.message?.includes('undefined') || err.message?.includes('Cannot read properties')) {
        pdfError = {
          type: 'validation',
          message: 'Dados incompletos ou inválidos',
          details: 'Verifique se todos os campos foram preenchidos corretamente. ' + (err.message || '')
        };
      } else if (err.message?.includes('data de nascimento') || err.message?.includes('Nome')) {
        pdfError = {
          type: 'validation',
          message: 'Dados obrigatórios não fornecidos',
          details: err.message
        };
      } else {
        pdfError = {
          type: 'generation',
          message: 'Erro ao gerar o PDF',
          details: err.message || 'Erro desconhecido'
        };
      }
      
      setError(pdfError);
      setShowErrorModal(true);

    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, [handleProgress]);

  const retry = useCallback(() => {
    setShowErrorModal(false);
    setError(null);
  }, []);

  const closeErrorModal = useCallback(() => {
    setShowErrorModal(false);
  }, []);

  return {
    isGenerating,
    progress,
    error,
    showErrorModal,
    generatePdf,
    retry,
    closeErrorModal
  };
};
