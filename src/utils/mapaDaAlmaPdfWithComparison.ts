import jsPDF from 'jspdf';
import { SavedProfile } from './profileStorage';
import { generateMapaDaAlmaPDF } from './mapaDaAlmaPdfGenerator';
import { addBackgroundImage } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';
import { renderCombinedPage1 } from './mapaDaAlmaPdfPage1Comparison';
import { renderCombinedPage2 } from './mapaDaAlmaPdfPage2Comparison';

export const generateMapaDaAlmaWithComparison = async (
  primaryProfile: SavedProfile,
  comparisonProfiles: SavedProfile[]
): Promise<void> => {
  try {
    console.log('🚀 [PDF] Iniciando geração do PDF com comparação');
    
    // Validação básica
    if (!primaryProfile?.results || !primaryProfile?.name || !primaryProfile?.birthDate) {
      throw new Error('Perfil principal com dados incompletos');
    }
    
    if (!comparisonProfiles?.length) {
      throw new Error('Nenhum perfil de comparação fornecido');
    }

    // Gerar PDF base (9 páginas)
    console.log('📄 [PDF] Gerando PDF base...');
    const baseData = {
      numerology: {
        results: primaryProfile.results,
        name: primaryProfile.name,
        birthDate: primaryProfile.birthDate,
      },
      personalYear: primaryProfile.personalYear ? {
        year: primaryProfile.personalYear,
        birthMonth: parseInt(primaryProfile.birthDate.split('-')[1]),
        day: primaryProfile.birthDate.split('-')[2],
        month: primaryProfile.birthDate.split('-')[1],
      } : undefined,
    };

    const result = await generateMapaDaAlmaPDF(baseData, true);
    if (!result?.pdf) {
      throw new Error('Falha ao gerar PDF base');
    }
    
    console.log('✅ [PDF] PDF base gerado');
    const { pdf } = result;
    const allProfiles = [primaryProfile, ...comparisonProfiles];
    
    // Adicionar páginas de comparação
    try {
      console.log('📄 [PDF] Adicionando página 10...');
      pdf.addPage();
      await addBackgroundImage(pdf, PDF_IMG.BG);
      await renderCombinedPage1(pdf, allProfiles);
      console.log('✅ [PDF] Página 10 adicionada');
    } catch (error) {
      console.error('❌ [PDF] Erro na página 10:', error);
      // Continua mesmo com erro
    }

    try {
      console.log('📄 [PDF] Adicionando página 11...');
      pdf.addPage();
      await addBackgroundImage(pdf, PDF_IMG.BG);
      await renderCombinedPage2(pdf, allProfiles);
      console.log('✅ [PDF] Página 11 adicionada');
    } catch (error) {
      console.error('❌ [PDF] Erro na página 11:', error);
      // Continua mesmo com erro
    }

    const filename = `mapa-completo-${primaryProfile.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    console.log('💾 [PDF] Salvando:', filename);
    pdf.save(filename);
    console.log('✅ [PDF] Concluído!');
  } catch (error) {
    console.error('❌ [PDF] Erro:', error);
    throw error;
  }
};
