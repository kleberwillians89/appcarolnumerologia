import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { SavedProfile } from './profileStorage';
import { captureChartAsBase64 } from './chartToPdfImage';
import ComparisonRadarChart from '@/components/charts/ComparisonRadarChart';
import ComparisonBarChart from '@/components/charts/ComparisonBarChart';
import ComparisonTimelineChart from '@/components/charts/ComparisonTimelineChart';

export async function captureComparisonCharts(profiles: SavedProfile[]): Promise<{
  radarChart: string;
  barChart: string;
  timelineChart: string;
}> {
  console.log('📊 [CHARTS] Iniciando captura de gráficos');
  
  if (!profiles || !Array.isArray(profiles) || profiles.length < 2) {
    throw new Error('É necessário pelo menos 2 perfis para capturar gráficos');
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.height = '600px';
  container.style.backgroundColor = '#1e293b';
  document.body.appendChild(container);

  try {
    console.log('📊 [CHARTS] Capturando radar...');
    const radarChart = await captureChart(container, ComparisonRadarChart, profiles);
    console.log('✅ [CHARTS] Radar capturado');
    
    console.log('📊 [CHARTS] Capturando barra...');
    const barChart = await captureChart(container, ComparisonBarChart, profiles);
    console.log('✅ [CHARTS] Barra capturado');
    
    console.log('📊 [CHARTS] Capturando timeline...');
    const timelineChart = await captureChart(container, ComparisonTimelineChart, profiles);
    console.log('✅ [CHARTS] Timeline capturado');

    return { radarChart, barChart, timelineChart };
  } catch (error) {
    console.error('❌ [CHARTS] Erro:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}

async function captureChart(
  container: HTMLElement,
  ChartComponent: any,
  profiles: SavedProfile[]
): Promise<string> {
  container.innerHTML = '';
  const root = createRoot(container);
  
  return new Promise((resolve, reject) => {
    try {
      root.render(createElement(ChartComponent, { profiles }));
      
      setTimeout(async () => {
        try {
          const imageData = await captureChartAsBase64(container);
          root.unmount();
          resolve(imageData);
        } catch (error) {
          console.error('❌ Erro ao capturar:', error);
          root.unmount();
          reject(error);
        }
      }, 2500);
    } catch (error) {
      console.error('❌ Erro ao renderizar:', error);
      root.unmount();
      reject(error);
    }
  });
}
