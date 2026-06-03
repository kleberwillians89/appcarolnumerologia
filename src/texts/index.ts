import { soulNumberInterpretations } from './soul';
import { destinyNumberInterpretations } from './destiny';
import { domNumberInterpretations } from './dom';
import { talentNumberInterpretations } from './talent';
import { dreamNumberInterpretations } from './dream';
import { challengeNumberInterpretations } from './challengeNumbers';
import { personalYearInterpretations } from './personalYear';
import { quarterCycleTexts } from './quarterCycles';
import { lifeCyclesIntroText, lifeCycleGeneralMeanings } from './lifeCycles';
import { presentsIntroText, challengesIntroText } from './presentsAndChallenges';
import { presentNumberInterpretations } from './presents';
import { soulSynopsis, destinySynopsis, domSynopsis, talentSynopsis, dreamSynopsis } from './synopsis';
import { soulCompatibility, relationshipTypes } from './compatibility';
import { romanticAdvice, businessAdvice, friendshipAdvice } from './relationshipAdvice';

export { soulNumberInterpretations } from './soul';
export { destinyNumberInterpretations } from './destiny';
export { domNumberInterpretations } from './dom';
export { talentNumberInterpretations } from './talent';
export { dreamNumberInterpretations } from './dream';
export { challengeNumberInterpretations } from './challengeNumbers';
export { personalYearInterpretations } from './personalYear';
export { quarterCycleTexts } from './quarterCycles';
export { lifeCyclesIntroText, lifeCycleGeneralMeanings } from './lifeCycles';
export { presentsIntroText, challengesIntroText } from './presentsAndChallenges';
export { presentNumberInterpretations } from './presents';

export { soulSynopsis, destinySynopsis, domSynopsis, talentSynopsis, dreamSynopsis } from './synopsis';
export { soulCompatibility, relationshipTypes } from './compatibility';
export { romanticAdvice, businessAdvice, friendshipAdvice } from './relationshipAdvice';

export function getLifeCycleText(num: number, cycle: number): string {
  const cycleMeaning = lifeCycleGeneralMeanings[num];
  if (!cycleMeaning) return '';

  return cycleMeaning.description;
}

export function getChallengeText(num: number): string {
  return challengeNumberInterpretations[num] || '';
}

export function getChallengeNumberText(num: number): string {
  return challengeNumberInterpretations[num] || '';
}


export function getPersonalYearText(num: number): string {
  return personalYearInterpretations[num] || '';
}

export function getQuarterCycleText(
  num: number, 
  quarter?: number, 
  challenges?: { first: number; second: number; major: number }
): { title: string; description: string } {
  // Se o número do trimestre for 0, verifica se há desafio com 0 no mapa
  if (num === 0 && challenges) {
    const hasZeroChallenge = 
      challenges.first === 0 || 
      challenges.second === 0 || 
      challenges.major === 0;
    
    if (hasZeroChallenge) {
      return quarterCycleTexts['0_with_challenge'] || quarterCycleTexts[0];
    }
  }
  
  return quarterCycleTexts[num] || { title: '', description: '' };
}

