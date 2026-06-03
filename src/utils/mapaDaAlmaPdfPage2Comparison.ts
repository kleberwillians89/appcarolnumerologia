import jsPDF from 'jspdf';
import { SavedProfile } from './profileStorage';
import { captureComparisonCharts } from './comparisonChartCapture';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox } from './mapaDaAlmaPdfHelpers';

const SAFE_TOP = MARGIN + 130;
const MAX_CHART_HEIGHT = 240;

export async function renderCombinedPage2(pdf: jsPDF, profiles: SavedProfile[]) {
  try {
    console.log('📄 [PG2] Renderizando página 2');
    
    if (!profiles?.length) {
      throw new Error('Nenhum perfil fornecido');
    }
    
    let y = SAFE_TOP;
    const isThreeProfiles = profiles.length === 3;
    
    addText(pdf, 'Ciclos e Desafios', 297.5, y, { 
      size: 22, color: COLORS.gold, style: 'bold', align: 'center' 
    });
    y += 32;

    // Mostrar ciclos lado a lado
    const colWidth = CONTENT_WIDTH / profiles.length;
    const nameSize = isThreeProfiles ? 8 : 9;
    const circleRadius = isThreeProfiles ? 9 : 10;
    const circleNumberSize = isThreeProfiles ? 11 : 12;
    
    profiles.forEach((profile, pIdx) => {
      const colX = MARGIN + pIdx * colWidth;
      const displayName = profile.profileName || profile.name || 'Perfil';
      const truncated = displayName.length > 15 ? displayName.substring(0, 13) + '...' : displayName;
      
      addText(pdf, truncated, colX + colWidth / 2, y, { 
        size: nameSize, color: COLORS.gold, style: 'bold', align: 'center' 
      });
      
      if (profile.data?.lifeCycles) {
        const cycles = Object.values(profile.data.lifeCycles);
        const cycleSpacing = (colWidth - 20) / 3;
        
        cycles.slice(0, 3).forEach((cycle: any, i) => {
          const x = colX + 10 + i * cycleSpacing + cycleSpacing / 2;
          pdf.setFillColor(...COLORS.gold);
          pdf.circle(x, y + 35, circleRadius, 'F');
          addText(pdf, String(cycle.value || '-'), x, y + 39, { 
            size: circleNumberSize, color: COLORS.white, style: 'bold', align: 'center' 
          });
        });
      }
    });
    y += 70;

    // Desafios e Presentes do primeiro perfil
    const profile = profiles[0];
    const displayName = profile.profileName || profile.name || 'Perfil';
    const truncated = displayName.length > 20 ? displayName.substring(0, 18) + '...' : displayName;
    
    addText(pdf, `Desafios e Presentes: ${truncated}`, 297.5, y, { 
      size: 12, color: COLORS.ink, style: 'bold', align: 'center' 
    });
    y += 22;

    if (profile.data?.challenges) {
      addBox(pdf, MARGIN, y, CONTENT_WIDTH / 2 - 8, 95, { fill: COLORS.panel, border: COLORS.line });
      addText(pdf, 'DESAFIOS', MARGIN + 12, y + 16, { size: 9, color: [239, 68, 68] as [number, number, number], style: 'bold' });
      const challenges = Object.values(profile.data.challenges).slice(0, 2);
      challenges.forEach((ch: any, i) => {
        const label = ch.label?.length > 12 ? ch.label.substring(0, 10) + '...' : (ch.label || 'Desafio');
        addText(pdf, `${label}: ${ch.value}`, MARGIN + 12, y + 35 + i * 24, { size: 8, color: COLORS.ink });
      });
    }

    if (profile.data?.presents) {
      addBox(pdf, MARGIN + CONTENT_WIDTH / 2 + 8, y, CONTENT_WIDTH / 2 - 8, 95, { fill: COLORS.panel, border: COLORS.line });
      addText(pdf, 'PRESENTES', MARGIN + CONTENT_WIDTH / 2 + 20, y + 16, { size: 9, color: [34, 197, 94] as [number, number, number], style: 'bold' });
      const presents = Object.values(profile.data.presents).slice(0, 2);
      presents.forEach((pr: any, i) => {
        const label = pr.label?.length > 12 ? pr.label.substring(0, 10) + '...' : (pr.label || 'Presente');
        addText(pdf, `${label}: ${pr.value}`, MARGIN + CONTENT_WIDTH / 2 + 20, y + 35 + i * 24, { size: 8, color: COLORS.ink });
      });
    }
    y += 115;

    // Gráfico Radar (opcional - não falha se der erro)
    try {
      console.log('📄 [PG2] Capturando gráfico...');
      const charts = await captureComparisonCharts(profiles);
      
      addText(pdf, 'Gráfico Radar Comparativo', 297.5, y, { size: 14, color: COLORS.gold, style: 'bold', align: 'center' });
      y += 22;
      
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = charts.radarChart;
      });
      
      const maxW = CONTENT_WIDTH - 80;
      const scale = Math.min(maxW / img.width, MAX_CHART_HEIGHT / img.height, 0.7);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = MARGIN + (CONTENT_WIDTH - w) / 2;
      
      pdf.addImage(charts.radarChart, 'PNG', x, y, w, h);
      console.log('✅ [PG2] Gráfico adicionado');
    } catch (error) {
      console.warn('⚠️ [PG2] Gráfico não adicionado:', error);
    }
    
    console.log('✅ [PG2] Concluída');
  } catch (error) {
    console.error('❌ [PG2] Erro:', error);
    throw error;
  }
}
