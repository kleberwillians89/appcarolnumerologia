import jsPDF from 'jspdf';
import { NumerologyResult } from './numerologyCalculations';
import { calculateLifeCycles } from './numerologyCalculations2';
import { getManifestForPage } from '../config/pdfManifest';
import { addBackgroundImage, renderPlaceholder, resetRenderedPlaceholders } from './pdfHelpers';
import { addLifeCyclesTimeline } from './pdfLifeCyclesVisual';
import { formatDateBR } from './dateUtils';


export const generatePDF = async (result: NumerologyResult, name: string, birthDate: string) => {
  console.log('🚀 PDF GENERATION START');
  console.log('📊 Input data:', { name, birthDate, resultKeys: Object.keys(result) });
  
  try {
    resetRenderedPlaceholders();
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    console.log('✅ jsPDF instance created');

    const pages = ['cover', 'resume', 'lifePathNumber', 'destinyNumber', 'soulNumber', 'personalityNumber', 
                   'birthdayNumber', 'maturityNumber', 'lifeCycles', 'challengeNumbers', 'presentsAndChallenges',
                   'quarterCycles', 'personalYear'];

    let successfulPages = 0;
    let failedImages = 0;

    for (let i = 0; i < pages.length; i++) {
      const pageName = pages[i];
      console.log(`\n📄 PAGE ${i + 1}/${pages.length}: ${pageName}`);
      
      try {
        const manifest = getManifestForPage(pageName);
        console.log(`  ✓ Manifest loaded for ${pageName}`);
        console.log(`  📝 Elements count: ${manifest.elements?.length || 0}`);
        console.log(`  🖼️ Background image: ${manifest.backgroundImage}`);
        
        if (i > 0) {
          pdf.addPage();
          console.log(`  ✓ New page added`);
        }

        // Add background image
        if (manifest.backgroundImage) {
          try {
            console.log(`  🖼️ Loading background image: ${manifest.backgroundImage}`);
            await addBackgroundImage(pdf, manifest.backgroundImage);
            console.log(`  ✅ Background image added successfully`);
          } catch (bgError) {
            console.error(`  ❌ Background image FAILED for ${pageName}:`, bgError);
            failedImages++;
            // Continue without background
            console.log(`  ⚠️ Continuing without background image`);
          }
        }

        // Add visual timeline for life cycles page
        if (pageName === 'lifeCycles') {
          try {
            const [year, month, day] = birthDate.split('-').map(Number);
            const cycles = calculateLifeCycles(day, month, year);
            addLifeCyclesTimeline(pdf, cycles, 100);
            console.log(`  ✅ Life cycles timeline added`);
          } catch (timelineError) {
            console.error(`  ⚠️ Failed to add life cycles timeline:`, timelineError);
          }
        }

        // Add text elements
        if (manifest.elements && manifest.elements.length > 0) {
          const birthDateFormatted = formatDateBR(birthDate);
          const data = { result, name, birthDate, person: { name, birthDateFormatted } };

          for (const element of manifest.elements) {
            try {
              renderPlaceholder(pdf, element, data);
            } catch (textError) {
              console.error(`  ⚠️ Failed to add text element:`, textError);
            }
          }
          console.log(`  ✓ Text elements added`);
        }


        
        successfulPages++;
        console.log(`  ✅ Page ${pageName} completed successfully`);
      } catch (pageError) {
        console.error(`  ❌ ERROR rendering page ${pageName}:`, pageError);
      }
    }

    console.log(`\n📊 GENERATION SUMMARY:`);
    console.log(`  ✅ Successful pages: ${successfulPages}/${pages.length}`);
    console.log(`  ⚠️ Failed images: ${failedImages}`);
    console.log(`\n💾 Attempting to save PDF...`);
    
    const filename = `numerology-report-${name.replace(/\s+/g, '-')}.pdf`;
    console.log(`  📁 Filename: ${filename}`);
    
    pdf.save(filename);
    console.log(`✅ PDF DOWNLOAD TRIGGERED SUCCESSFULLY`);
    
    return true;
  } catch (error) {
    console.error('❌ CRITICAL ERROR in PDF generation:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Emergency fallback: Create minimal PDF
    console.log('🆘 Creating emergency fallback PDF...');
    try {
      const fallbackPdf = new jsPDF();
      fallbackPdf.setFontSize(20);
      fallbackPdf.text('Numerology Report', 20, 20);
      fallbackPdf.setFontSize(12);
      fallbackPdf.text(`Name: ${name}`, 20, 40);
      fallbackPdf.text(`Birth Date: ${birthDate}`, 20, 50);
      fallbackPdf.text('Error generating full report. Please try again.', 20, 70);
      fallbackPdf.save(`numerology-report-${name.replace(/\s+/g, '-')}-fallback.pdf`);
      console.log('✅ Fallback PDF downloaded');
      return false;
    } catch (fallbackError) {
      console.error('❌ Even fallback PDF failed:', fallbackError);
      throw error;
    }
  }
};
