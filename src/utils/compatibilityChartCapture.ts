import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { CompatibilityResult } from './compatibilityCalculations';
import { captureChartAsBase64 } from './chartToPdfImage';
import CompatibilityRadarChart from '@/components/charts/CompatibilityRadarChart';

export async function captureCompatibilityRadarChart(result: CompatibilityResult): Promise<string> {
  console.log('📊 [COMPATIBILITY] Iniciando captura do gráfico de radar');
  
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.height = '500px';
  container.style.backgroundColor = '#1e293b';
  document.body.appendChild(container);

  try {
    const root = createRoot(container);
    
    return await new Promise((resolve, reject) => {
      try {
        root.render(createElement(CompatibilityRadarChart, { result }));
        
        setTimeout(async () => {
          try {
            const imageData = await captureChartAsBase64(container);
            root.unmount();
            console.log('✅ [COMPATIBILITY] Gráfico capturado com sucesso');
            resolve(imageData);
          } catch (error) {
            console.error('❌ [COMPATIBILITY] Erro ao capturar:', error);
            root.unmount();
            reject(error);
          }
        }, 2500);
      } catch (error) {
        console.error('❌ [COMPATIBILITY] Erro ao renderizar:', error);
        root.unmount();
        reject(error);
      }
    });
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
