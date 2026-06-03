import html2canvas from 'html2canvas';

/**
 * Captura um elemento HTML como imagem base64 para inserir no PDF
 */
export async function captureChartAsBase64(
  element: HTMLElement
): Promise<string> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#1e293b',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Erro ao capturar gráfico:', error);
    throw new Error('Falha ao capturar gráfico como imagem');
  }
}

/**
 * Renderiza um componente React temporariamente e captura como imagem
 */
export async function renderAndCaptureChart(
  renderFn: () => HTMLElement,
  cleanup: () => void
): Promise<string> {
  try {
    const element = renderFn();
    await new Promise(resolve => setTimeout(resolve, 500));
    const imageData = await captureChartAsBase64(element);
    cleanup();
    return imageData;
  } catch (error) {
    cleanup();
    throw error;
  }
}
