import jsPDF from 'jspdf';
import { CompatibilityResult } from './compatibilityCalculations';
import { calculateLifeCycles, calculatePersonalYear } from './numerologyCalculations2';
import { soulCompatibility, getLifeCycleText } from '../texts';
import { compatibilityManifest } from '../config/compatibilityManifest';
import { addBackgroundImage, renderPlaceholder, resetRenderedPlaceholders, formatMasterNumber } from './pdfHelpers';
import { captureCompatibilityRadarChart } from './compatibilityChartCapture';

export async function generateCompatibilityPDF(input: { result: CompatibilityResult; relationshipType: string }) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const { result, relationshipType } = input;
    
    const [year1, month1, day1] = result.person1.birthDate.split('-').map(Number);
    const [year2, month2, day2] = result.person2.birthDate.split('-').map(Number);
    
    const lifeCycles1 = calculateLifeCycles(day1, month1, year1);
    const lifeCycles2 = calculateLifeCycles(day2, month2, year2);
    const personalYear1 = calculatePersonalYear(day1, month1);
    const personalYear2 = calculatePersonalYear(day2, month2);
    
    const compatKey = `${result.numbers.person1.soul}-${result.numbers.person2.soul}`;
    const compatData = soulCompatibility[compatKey] || soulCompatibility['1-1'];
    
    const radarChartImage = await captureCompatibilityRadarChart(result);
    
    const data = {
      person1: { 
        ...result.person1, 
        soul: formatMasterNumber(result.numbers.person1.soul),
        destiny: formatMasterNumber(result.numbers.person1.destiny),
        talent: formatMasterNumber(result.numbers.person1.talent),
        personalYear: formatMasterNumber(personalYear1),
        cycles: {
          first: { 
            title: `Ciclo 1 (0-28): ${formatMasterNumber(lifeCycles1.first.value)}`, 
            body: getLifeCycleText(lifeCycles1.first.value, 1) 
          },
          second: { 
            title: `Ciclo 2 (29-56): ${formatMasterNumber(lifeCycles1.second.value)}`, 
            body: getLifeCycleText(lifeCycles1.second.value, 2) 
          },
          third: { 
            title: `Ciclo 3 (57+): ${formatMasterNumber(lifeCycles1.third.value)}`, 
            body: getLifeCycleText(lifeCycles1.third.value, 3) 
          }
        }
      },
      person2: { 
        ...result.person2, 
        soul: formatMasterNumber(result.numbers.person2.soul),
        destiny: formatMasterNumber(result.numbers.person2.destiny),
        talent: formatMasterNumber(result.numbers.person2.talent),
        personalYear: formatMasterNumber(personalYear2),
        cycles: {
          first: { 
            title: `Ciclo 1 (0-28): ${formatMasterNumber(lifeCycles2.first.value)}`, 
            body: getLifeCycleText(lifeCycles2.first.value, 1) 
          },
          second: { 
            title: `Ciclo 2 (29-56): ${formatMasterNumber(lifeCycles2.second.value)}`, 
            body: getLifeCycleText(lifeCycles2.second.value, 2) 
          },
          third: { 
            title: `Ciclo 3 (57+): ${formatMasterNumber(lifeCycles2.third.value)}`, 
            body: getLifeCycleText(lifeCycles2.third.value, 3) 
          }
        }
      },
      scores: result.scores,
      numbers: result.numbers,
      relationshipType,
      compatibility: compatData,
      harmonyText: compatData.harmony || '',
      challengeText: compatData.challenge || '',
      radarChartImage
    };

    
    let isFirstPage = true;
    for (const pageManifest of compatibilityManifest) {
      if (pageManifest.condition && !pageManifest.condition(data)) continue;
      
      if (!isFirstPage) pdf.addPage();
      isFirstPage = false;
      
      await addBackgroundImage(pdf, pageManifest.background.src);
      resetRenderedPlaceholders();
      
      for (const placeholder of pageManifest.placeholders) {
        renderPlaceholder(pdf, placeholder, data);
      }
    }
    
    pdf.save(`compatibilidade-${result.person1.name}-${result.person2.name}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF Error:', error);
    return false;
  }
}
