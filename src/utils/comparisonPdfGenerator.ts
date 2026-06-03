import jsPDF from 'jspdf';
import { SavedProfile } from './profileStorage';
import { COLORS, MARGIN, CONTENT_WIDTH, addText, addBox, addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { renderCompatibilityPage, renderCyclesComparison, renderChallengesComparison, renderChartPage } from './comparisonPdfHelpers';
import { captureComparisonCharts } from './comparisonChartCapture';
import { captureMatrixAsImage } from './matrixImageCapture';



export const generateComparisonPDF = async (profiles: SavedProfile[]): Promise<void> => {
  try {
    console.log('🚀 Iniciando geração de PDF de comparação', profiles);
    
    // Validação robusta
    if (!profiles || !Array.isArray(profiles)) {
      throw new Error('Parâmetro profiles inválido');
    }
    
    if (profiles.length < 2) {
      throw new Error('É necessário pelo menos 2 perfis para comparar');
    }

    // Validar dados de cada perfil
    for (const profile of profiles) {
      if (!profile.results || !profile.name || !profile.birthDate) {
        throw new Error(`Perfil "${profile.profileName || 'sem nome'}" possui dados incompletos`);
      }
    }

    const pdf = new jsPDF();

    // Página 1: Capa
    console.log('📄 Gerando página 1: Capa');
    await addBackgroundImage(pdf, PDF_IMG.CAPA);

    // Página 2: Números Comparativos
    console.log('📄 Gerando página 2: Números');
    pdf.addPage();
    await addBackgroundImage(pdf, PDF_IMG.BG);
    await renderNumbersComparison(pdf, profiles);

    // Página 3: Compatibilidade (se 2 perfis)
    if (profiles.length === 2) {
      console.log('📄 Gerando página 3: Compatibilidade');
      pdf.addPage();
      await addBackgroundImage(pdf, PDF_IMG.BG);
      await renderCompatibilityPage(pdf, profiles[0], profiles[1]);
    }

    // Página 4: Ciclos de Vida
    console.log('📄 Gerando página 4: Ciclos');
    pdf.addPage();
    await addBackgroundImage(pdf, PDF_IMG.BG);
    await renderCyclesComparison(pdf, profiles);

    // Página 5+: Desafios e Presentes
    console.log('📄 Gerando páginas de Desafios e Presentes');
    pdf.addPage();
    await renderChallengesComparison(pdf, profiles);

    // Adicionar Matriz de Similaridade (se 3+ perfis)
    if (profiles.length >= 3) {
      console.log('📊 Capturando matriz de similaridade...');
      try {
        const matrixImage = await captureMatrixAsImage('similarity-matrix-export');
        pdf.addPage();
        await addBackgroundImage(pdf, PDF_IMG.BG);
        await renderChartPage(pdf, matrixImage, 'Matriz de Similaridade');
        console.log('✅ Matriz de similaridade adicionada');
      } catch (matrixError) {
        console.warn('⚠️ Erro ao capturar matriz, continuando sem ela:', matrixError);
      }
    }

    // Capturar e adicionar gráficos
    console.log('📊 Capturando gráficos interativos...');
    try {
      const charts = await captureComparisonCharts(profiles);
      
      // Página: Gráfico Radar
      console.log('📄 Gerando página: Gráfico Radar');
      pdf.addPage();
      await addBackgroundImage(pdf, PDF_IMG.BG);
      await renderChartPage(pdf, charts.radarChart, 'Gráfico Radar Comparativo');
      
      // Página: Gráfico de Barras
      console.log('📄 Gerando página: Gráfico de Barras');
      pdf.addPage();
      await addBackgroundImage(pdf, PDF_IMG.BG);
      await renderChartPage(pdf, charts.barChart, 'Comparação de Desafios');
      
      // Página: Timeline
      console.log('📄 Gerando página: Timeline');
      pdf.addPage();
      await addBackgroundImage(pdf, PDF_IMG.BG);
      await renderChartPage(pdf, charts.timelineChart, 'Linha do Tempo dos Ciclos');
      
      console.log('✅ Gráficos adicionados com sucesso');
    } catch (chartError) {
      console.warn('⚠️ Erro ao capturar gráficos, continuando sem eles:', chartError);
    }


    const filename = `comparacao-perfis-${Date.now()}.pdf`;
    console.log('✅ PDF gerado com sucesso:', filename);
    pdf.save(filename);
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de comparação:', error);
    throw error;
  }
};

const renderNumbersComparison = async (pdf: jsPDF, profiles: SavedProfile[]) => {
  let y = MARGIN + 130;
  addText(pdf, 'Comparação de Perfis', 297.5, y, { 
    size: 26, color: COLORS.gold, font: 'helvetica', style: 'bold', align: 'center' 
  });
  y += 18;

  const names = profiles.map(p => p.profileName || p.name).join(' • ');
  addText(pdf, names, 297.5, y, { 
    size: 11, color: COLORS.muted, align: 'center' 
  });
  y += 40;

  const numbers = [
    { key: 'soul', label: 'Alma' },
    { key: 'destiny', label: 'Destino' },
    { key: 'dom', label: 'Dom' },
    { key: 'talent', label: 'Talento' },
    { key: 'dream', label: 'Sonho' }
  ];

  const cardHeight = 80;
  const gutter = 12;

  numbers.forEach((num, i) => {
    const cardY = y + i * (cardHeight + gutter);
    addBox(pdf, MARGIN, cardY, CONTENT_WIDTH, cardHeight, { 
      fill: COLORS.panel, border: COLORS.line 
    });

    addText(pdf, num.label, MARGIN + 20, cardY + 28, { 
      size: 14, color: COLORS.charcoal, style: 'bold' 
    });

    const colWidth = (CONTENT_WIDTH - 120) / profiles.length;
    profiles.forEach((p, idx) => {
      const x = MARGIN + 120 + idx * colWidth;
      const value = p.results?.[num.key as keyof typeof p.results] || '-';
      
      pdf.setFillColor(...COLORS.gold);
      pdf.circle(x + colWidth / 2, cardY + 40, 18, 'F');
      
      addText(pdf, String(value), x + colWidth / 2, cardY + 46, { 
        size: 20, color: COLORS.white, style: 'bold', align: 'center' 
      });
    });
  });
};
