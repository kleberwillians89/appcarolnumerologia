import { SavedProfile } from '@/utils/profileStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Star } from 'lucide-react';
import { analyzeCompatibility, calculateCompatibilityScore } from '@/utils/comparisonAnalysis';

export default function CompatibilityAnalysis({ profile1, profile2 }: { profile1: SavedProfile; profile2: SavedProfile }) {
  const score = calculateCompatibilityScore(profile1, profile2);
  const insights = analyzeCompatibility(profile1, profile2);

  return (
    <Card className="bg-slate-800/50 border-pink-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Heart className="h-5 w-5 text-pink-500" />
          Análise de Compatibilidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-pink-500 mb-2">{score}%</div>
          <p className="text-slate-300">Índice de Compatibilidade</p>
        </div>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-yellow-500 mb-1">{insight.category}</div>
                  <div className="text-sm text-slate-300">{insight.insight}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
