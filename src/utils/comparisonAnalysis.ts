import { SavedProfile } from './profileStorage';

export interface ComparisonInsight {
  category: string;
  insight: string;
  type: 'positive' | 'neutral' | 'challenge';
}

export const analyzeCompatibility = (profile1: SavedProfile, profile2: SavedProfile): ComparisonInsight[] => {
  const insights: ComparisonInsight[] = [];
  const r1 = profile1.results;
  const r2 = profile2.results;

  if (!r1 || !r2) return insights;

  // Soul number compatibility
  if (r1.soul === r2.soul) {
    insights.push({
      category: 'Alma',
      insight: 'Ambos compartilham o mesmo número da Alma, indicando valores e desejos internos similares.',
      type: 'positive'
    });
  } else if (Math.abs(r1.soul - r2.soul) <= 2) {
    insights.push({
      category: 'Alma',
      insight: 'Números da Alma próximos sugerem compreensão mútua e valores complementares.',
      type: 'neutral'
    });
  }

  // Destiny compatibility
  if (r1.destiny === r2.destiny) {
    insights.push({
      category: 'Destino',
      insight: 'Caminhos de vida idênticos indicam objetivos e propósitos alinhados.',
      type: 'positive'
    });
  }

  // Dom compatibility
  const domDiff = Math.abs(r1.dom - r2.dom);
  if (domDiff === 0) {
    insights.push({
      category: 'Dom',
      insight: 'Mesmo Dom do Destino sugere forte ressonância energética.',
      type: 'positive'
    });
  } else if (domDiff >= 5) {
    insights.push({
      category: 'Dom',
      insight: 'Diferença significativa no Dom pode trazer perspectivas complementares.',
      type: 'neutral'
    });
  }

  return insights;
};

export const calculateCompatibilityScore = (profile1: SavedProfile, profile2: SavedProfile): number => {
  const r1 = profile1.results;
  const r2 = profile2.results;
  if (!r1 || !r2) return 0;

  let score = 0;
  const weights = { soul: 25, destiny: 25, dom: 20, talent: 15, dream: 15 };

  Object.keys(weights).forEach(key => {
    const diff = Math.abs(r1[key] - r2[key]);
    const similarity = Math.max(0, 9 - diff) / 9;
    score += similarity * weights[key as keyof typeof weights];
  });

  return Math.round(score);
};

// Multi-profile comparison functions
export interface ProfileSimilarity {
  profile1Id: string;
  profile2Id: string;
  score: number;
  commonNumbers: string[];
}

export interface SimilarityMatrix {
  profiles: SavedProfile[];
  matrix: number[][];
  similarities: ProfileSimilarity[];
}

export const calculateSimilarityMatrix = (profiles: SavedProfile[]): SimilarityMatrix => {
  const matrix: number[][] = [];
  const similarities: ProfileSimilarity[] = [];

  for (let i = 0; i < profiles.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < profiles.length; j++) {
      if (i === j) {
        matrix[i][j] = 100;
      } else if (j < i) {
        matrix[i][j] = matrix[j][i];
      } else {
        const score = calculateCompatibilityScore(profiles[i], profiles[j]);
        matrix[i][j] = score;
        
        similarities.push({
          profile1Id: profiles[i].id,
          profile2Id: profiles[j].id,
          score,
          commonNumbers: findCommonNumbers(profiles[i], profiles[j])
        });
      }
    }
  }

  return { profiles, matrix, similarities };
};

export const findCommonNumbers = (profile1: SavedProfile, profile2: SavedProfile): string[] => {
  const common: string[] = [];
  const r1 = profile1.results;
  const r2 = profile2.results;
  
  if (!r1 || !r2) return common;

  const fields = ['soul', 'destiny', 'dom', 'talent', 'dream'] as const;
  fields.forEach(field => {
    if (r1[field] === r2[field]) {
      common.push(field);
    }
  });

  return common;
};

export const groupProfilesBySimilarity = (profiles: SavedProfile[], threshold: number = 70): SavedProfile[][] => {
  if (profiles.length <= 1) return [profiles];

  const groups: SavedProfile[][] = [];
  const assigned = new Set<string>();

  profiles.forEach(profile => {
    if (assigned.has(profile.id)) return;

    const group = [profile];
    assigned.add(profile.id);

    profiles.forEach(otherProfile => {
      if (profile.id !== otherProfile.id && !assigned.has(otherProfile.id)) {
        const score = calculateCompatibilityScore(profile, otherProfile);
        if (score >= threshold) {
          group.push(otherProfile);
          assigned.add(otherProfile.id);
        }
      }
    });

    groups.push(group);
  });

  return groups;
};

export const findProfileDifferences = (profiles: SavedProfile[]): { field: string; values: number[]; allSame: boolean }[] => {
  if (profiles.length === 0) return [];

  const fields = ['soul', 'destiny', 'dom', 'talent', 'dream'] as const;
  const differences: { field: string; values: number[]; allSame: boolean }[] = [];

  fields.forEach(field => {
    const values = profiles.map(p => p.results?.[field] || 0);
    const allSame = values.every(v => v === values[0]);
    
    differences.push({
      field,
      values,
      allSame
    });
  });

  return differences;
};
