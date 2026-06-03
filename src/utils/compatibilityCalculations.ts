import { calculateSoulNumber, calculateTalentNumber } from './numerologyCalculations';
import { calculateLifeCycles, calculateDestinyPath } from './numerologyCalculations2';


export interface PersonData {
  name: string;
  day: number;
  month: number;
  year: number;
}

export interface CompatibilityScore {
  soul: number;
  destiny: number;
  talent: number;
  lifeCycle: number;
  overall: number;
}

export interface CompatibilityResult {
  person1: PersonData;
  person2: PersonData;
  scores: CompatibilityScore;
  numbers: {
    person1: { soul: number; destiny: number; talent: number; currentCycle: number };
    person2: { soul: number; destiny: number; talent: number; currentCycle: number };
  };
}

const getCompatibilityScore = (num1: number, num2: number): number => {
  if (num1 === num2) return 100;
  const diff = Math.abs(num1 - num2);
  if (diff === 1 || diff === 8) return 85;
  if (diff === 2 || diff === 7) return 75;
  if (diff === 3 || diff === 6) return 65;
  if (diff === 4 || diff === 5) return 55;
  return 50;
};

const getCurrentCycle = (day: number, month: number, year: number): number => {
  const cycles = calculateLifeCycles(day, month, year);
  const age = new Date().getFullYear() - year;
  if (age <= 28) return cycles.first.value;
  if (age <= 56) return cycles.second.value;
  return cycles.third.value;
};

export const calculateCompatibility = (p1: PersonData, p2: PersonData): CompatibilityResult => {
  const soul1 = calculateSoulNumber(p1.name);
  const soul2 = calculateSoulNumber(p2.name);
  const destiny1 = calculateDestinyPath(p1.day, p1.month, p1.year);
  const destiny2 = calculateDestinyPath(p2.day, p2.month, p2.year);
  const talent1 = calculateTalentNumber(p1.name);
  const talent2 = calculateTalentNumber(p2.name);
  const cycle1 = getCurrentCycle(p1.day, p1.month, p1.year);
  const cycle2 = getCurrentCycle(p2.day, p2.month, p2.year);

  const soulScore = getCompatibilityScore(soul1, soul2);
  const destinyScore = getCompatibilityScore(destiny1, destiny2);
  const talentScore = getCompatibilityScore(talent1, talent2);
  const cycleScore = getCompatibilityScore(cycle1, cycle2);
  const overall = Math.round((soulScore * 0.35 + destinyScore * 0.35 + talentScore * 0.2 + cycleScore * 0.1));

  return {
    person1: p1,
    person2: p2,
    scores: { soul: soulScore, destiny: destinyScore, talent: talentScore, lifeCycle: cycleScore, overall },
    numbers: {
      person1: { soul: soul1, destiny: destiny1, talent: talent1, currentCycle: cycle1 },
      person2: { soul: soul2, destiny: destiny2, talent: talent2, currentCycle: cycle2 },
    },
  };
};
