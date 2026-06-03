import html2canvas from 'html2canvas';

/**
 * Captura a matriz de similaridade como imagem PNG
 */
export async function captureMatrixAsImage(elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.warn(`⚠️ Elemento da matriz não encontrado: ${elementId}`);
    throw new Error(`Elemento da matriz não encontrado: ${elementId}. Certifique-se de que a matriz está visível na tela.`);
  }


  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Erro ao capturar matriz:', error);
    throw error;
  }
}

/**
 * Baixa a matriz como arquivo PNG
 */
export async function downloadMatrixAsPNG(elementId: string, filename: string = 'matriz-similaridade.png') {
  try {
    const dataUrl = await captureMatrixAsImage(elementId);
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Erro ao baixar matriz:', error);
    throw error;
  }
}
