import jsPDF from 'jspdf';
import { SavedProfile } from './profileStorage';
import { analyzeCompatibility, calculateCompatibilityScore } from './comparisonAnalysis';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox } from './mapaDaAlmaPdfHelpers';

const SAFE_TOP = MARGIN + 130;

// PÁGINA 1: Comparação de Perfis + Compatibilidade
export async function renderCombinedPage1(pdf: jsPDF, profiles: SavedProfile[]) {
  try {
    console.log('📄 [PÁGINA 1] Iniciando renderização da página de comparação');
    console.log('📄 [PÁGINA 1] Número de perfis:', profiles?.length || 0);
    
    if (!profiles || profiles.length === 0) {
      throw new Error('Nenhum perfil fornecido para renderização');
    }
    
    let y = SAFE_TOP;
    const isThreeProfiles = profiles.length === 3;
    
    // Título principal
    addText(pdf, 'Comparação de Perfis', 297.5, y, { 
      size: 22, color: COLORS.gold, style: 'bold', align: 'center' 
    });
    y += 32;

    // CABEÇALHO: Nomes dos perfis (otimizado para 3 perfis)
    const labelWidth = isThreeProfiles ? 70 : 90;
    const colWidth = (CONTENT_WIDTH - labelWidth) / profiles.length;
    const nameSize = isThreeProfiles ? 8 : 9;
    
    profiles.forEach((p, idx) => {
      const x = MARGIN + labelWidth + idx * colWidth;
      const displayName = p.profileName || p.name || 'Perfil';
      const truncated = displayName.length > 15 ? displayName.substring(0, 13) + '...' : displayName;
      addText(pdf, truncated, x + colWidth / 2, y, { 
        size: nameSize, color: COLORS.gold, style: 'bold', align: 'center' 
      });
    });
    y += 20;

    // Números comparativos (3 linhas compactas)
    const numbers = [
      { key: 'soul', label: 'Alma' },
      { key: 'destiny', label: 'Destino' },
      { key: 'dom', label: 'Dom' }
    ];

    const circleRadius = isThreeProfiles ? 11 : 13;
    const numberSize = isThreeProfiles ? 13 : 15;
    const rowHeight = isThreeProfiles ? 55 : 58;

    numbers.forEach((num, i) => {
      const cardY = y + i * rowHeight;
      addBox(pdf, MARGIN, cardY, CONTENT_WIDTH, 50, { fill: COLORS.panel, border: COLORS.line });
      addText(pdf, num.label, MARGIN + 12, cardY + 18, { size: 10, color: COLORS.charcoal, style: 'bold' });

      profiles.forEach((p, idx) => {
        const x = MARGIN + labelWidth + idx * colWidth;
        const value = p.results?.[num.key as keyof typeof p.results] || '-';
        pdf.setFillColor(...COLORS.gold);
        pdf.circle(x + colWidth / 2, cardY + 25, circleRadius, 'F');
        addText(pdf, String(value), x + colWidth / 2, cardY + 30, { 
          size: numberSize, color: COLORS.white, style: 'bold', align: 'center' 
        });
      });
    });
    y += rowHeight * 3 + 30;

    // Análise de Compatibilidade (apenas se 2 perfis)
    if (profiles.length === 2) {
      console.log('📄 [PÁGINA 1] Adicionando análise de compatibilidade');
      addText(pdf, 'Análise de Compatibilidade', 297.5, y, { 
        size: 18, color: COLORS.gold, style: 'bold', align: 'center' 
      });
      y += 28;

      const score = calculateCompatibilityScore(profiles[0], profiles[1]);
      addBox(pdf, MARGIN + 110, y, CONTENT_WIDTH - 220, 65, { 
        fill: [236, 72, 153, 0.1] as any, border: [236, 72, 153] as [number, number, number]
      });
      addText(pdf, `${score}%`, 297.5, y + 35, { 
        size: 28, color: [236, 72, 153] as [number, number, number], style: 'bold', align: 'center' 
      });
      addText(pdf, 'Compatibilidade', 297.5, y + 52, { 
        size: 9, color: COLORS.muted, align: 'center' 
      });
      y += 80;

      const insights = analyzeCompatibility(profiles[0], profiles[1]);
      insights.slice(0, 2).forEach((insight, i) => {
        const cardY = y + i * 68;
        addBox(pdf, MARGIN, cardY, CONTENT_WIDTH, 60, { fill: COLORS.panel, border: COLORS.line });
        addText(pdf, insight.category, MARGIN + 12, cardY + 18, { size: 9, color: COLORS.gold, style: 'bold' });
        const lines = pdf.splitTextToSize(insight.insight, CONTENT_WIDTH - 24);
        addText(pdf, lines.slice(0, 3).join('\n'), MARGIN + 12, cardY + 30, { size: 8, color: COLORS.ink });
      });
    }
    
    console.log('✅ [PÁGINA 1] Página de comparação renderizada com sucesso');
  } catch (error) {
    console.error('❌ [PÁGINA 1] Erro ao renderizar página de comparação:', error);
    throw error;
  }
}
