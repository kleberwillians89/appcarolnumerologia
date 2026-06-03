import { SavedProfile } from '@/utils/profileStorage';
import { SimilarityMatrix as SimilarityMatrixType } from '@/utils/comparisonAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Image as ImageIcon } from 'lucide-react';
import { downloadMatrixAsPNG } from '@/utils/matrixImageCapture';
import { toast } from 'sonner';

interface SimilarityMatrixProps {
  matrixData: SimilarityMatrixType;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Boa';
  if (score >= 40) return 'Moderada';
  return 'Baixa';
};

export default function SimilarityMatrix({ matrixData }: SimilarityMatrixProps) {
  const { profiles, matrix } = matrixData;

  const handleExportPNG = async () => {
    try {
      await downloadMatrixAsPNG('similarity-matrix-export', 'matriz-similaridade.png');
      toast.success('Matriz exportada como PNG!');
    } catch (error) {
      toast.error('Erro ao exportar matriz.');
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-white">Matriz de Similaridade</CardTitle>
            <Badge variant="secondary">{profiles.length}x{profiles.length}</Badge>
          </div>
          <Button onClick={handleExportPNG} variant="outline" size="sm" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Exportar PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div id="similarity-matrix-export" className="bg-slate-800 p-4 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-slate-400 text-sm"></th>
                {profiles.map((profile, i) => (
                  <th key={i} className="p-2 text-center text-slate-400 text-xs max-w-[80px] truncate">
                    {profile.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile, i) => (
                <tr key={i}>
                  <td className="p-2 text-slate-400 text-xs max-w-[80px] truncate font-medium">
                    {profile.name}
                  </td>
                  {matrix[i].map((score, j) => (
                    <td key={j} className="p-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`w-full h-12 flex items-center justify-center rounded cursor-pointer transition-all hover:scale-105 ${i === j ? 'bg-slate-700' : getScoreColor(score)}`}>
                              <span className="text-white font-bold text-sm">{i === j ? '—' : score}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">{i === j ? 'Mesmo perfil' : `${getScoreLabel(score)} compatibilidade`}</p>
                            {i !== j && <p className="text-xs">{score}% de similaridade</p>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
