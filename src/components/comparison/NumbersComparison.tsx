import { SavedProfile } from '@/utils/profileStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import NumerologyRadarChart from '@/components/charts/NumerologyRadarChart';
import { findProfileDifferences } from '@/utils/comparisonAnalysis';

interface NumbersComparisonProps {
  profiles: SavedProfile[];
  highlightIdentical?: boolean;
  showOnlyDifferences?: boolean;
}

export default function NumbersComparison({ 
  profiles, 
  highlightIdentical = false,
  showOnlyDifferences = false 
}: NumbersComparisonProps) {
  const numbers = ['soul', 'destiny', 'dom', 'talent', 'dream'];
  const labels = { soul: 'Alma', destiny: 'Destino', dom: 'Dom', talent: 'Talento', dream: 'Sonho' };
  const differences = findProfileDifferences(profiles);

  const getFieldDifference = (field: string) => {
    return differences.find(d => d.field === field);
  };

  const shouldShowRow = (field: string) => {
    if (!showOnlyDifferences) return true;
    const diff = getFieldDifference(field);
    return diff && !diff.allSame;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5 text-yellow-500" />
            Gráfico Radar - Números Numerológicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NumerologyRadarChart profiles={profiles} />
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white">Tabela Comparativa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3 text-slate-300">Número</th>
                  {profiles.map(p => (
                    <th key={p.id} className="text-center p-3 text-slate-300">{p.profileName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {numbers.filter(shouldShowRow).map(num => {
                  const diff = getFieldDifference(num);
                  const isIdentical = diff?.allSame;
                  
                  return (
                    <tr key={num} className="border-b border-slate-700 hover:bg-slate-700/30">
                      <td className="p-3 font-medium text-slate-200">{labels[num as keyof typeof labels]}</td>
                      {profiles.map(p => {
                        const value = p.results?.[num] || '-';
                        const badgeClass = highlightIdentical && isIdentical
                          ? "text-lg bg-green-500/30 text-green-400 ring-2 ring-green-500/50"
                          : "text-lg bg-yellow-500/20 text-yellow-500";
                        
                        return (
                          <td key={p.id} className="text-center p-3">
                            <Badge variant="secondary" className={badgeClass}>
                              {value}
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
