import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, Briefcase, Users, Download } from 'lucide-react';
import { CompatibilityResult } from '../utils/compatibilityCalculations';
import { soulCompatibility } from '../texts/compatibility';
import { generateCompatibilityPDF } from '@/utils/compatibilityPdfGenerator';
import { useState } from 'react';
import CompatibilityRadarChart from './charts/CompatibilityRadarChart';


interface CompatibilityResultsProps {
  result: CompatibilityResult;
  relationshipType: 'romantic' | 'business' | 'friendship';
}

export const CompatibilityResults = ({ result, relationshipType }: CompatibilityResultsProps) => {
  const { scores, numbers, person1, person2 } = result;
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Muito Bom';
    if (score >= 55) return 'Bom';
    return 'Moderado';
  };

  const soulKey = `${Math.min(numbers.person1.soul, numbers.person2.soul)}-${Math.max(numbers.person1.soul, numbers.person2.soul)}`;
  const soulComp = soulCompatibility[soulKey] || { harmony: 'Combinação única', challenge: 'Navegar com consciência' };

  const icons = { romantic: Heart, business: Briefcase, friendship: Users };
  const Icon = icons[relationshipType];

  const handleExportPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      
      const success = await generateCompatibilityPDF({
        result,
        relationshipType
      });
      
      if (success) {
        alert('PDF de Compatibilidade gerado com sucesso!');
      } else {
        alert('Erro ao gerar PDF. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">Resultado da Compatibilidade</h2>
        <p className="text-purple-200 text-lg">{person1.name} & {person2.name}</p>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          onClick={handleExportPDF} 
          disabled={isGeneratingPdf}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
        >
          {isGeneratingPdf ? (
            <>
              <Download className="w-4 h-4 mr-2 animate-bounce" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </>
          )}
        </Button>
      </div>

      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Icon className="w-16 h-16 text-purple-400" />
          </div>
          <CardTitle className="text-3xl text-white">Compatibilidade Geral</CardTitle>
          <div className={`text-6xl font-bold ${getScoreColor(scores.overall)} mt-4`}>
            {scores.overall}%
          </div>
          <Badge className="mt-2 text-lg px-4 py-1 bg-purple-500">{getScoreLabel(scores.overall)}</Badge>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-purple-300">Conexão da Alma</CardTitle>
            <div className="text-2xl font-bold text-white">{scores.soul}%</div>
          </CardHeader>
          <CardContent>
            <Progress value={scores.soul} className="mb-4" />
            <p className="text-sm text-purple-200 mb-2"><strong>Harmonia:</strong> {soulComp.harmony}</p>
            <p className="text-sm text-purple-200"><strong>Desafio:</strong> {soulComp.challenge}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-pink-300">Alinhamento do Destino</CardTitle>
            <div className="text-2xl font-bold text-white">{scores.destiny}%</div>
          </CardHeader>
          <CardContent>
            <Progress value={scores.destiny} className="mb-4" />
            <p className="text-sm text-pink-200">
              Seus caminhos de vida {scores.destiny >= 70 ? 'se alinham naturalmente' : 'requerem esforço consciente'}.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-indigo-300">Sinergia de Talentos</CardTitle>
            <div className="text-2xl font-bold text-white">{scores.talent}%</div>
          </CardHeader>
          <CardContent>
            <Progress value={scores.talent} className="mb-4" />
            <p className="text-sm text-indigo-200">
              Suas habilidades {scores.talent >= 70 ? 'se complementam' : 'oferecem oportunidades de crescimento'}.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-teal-300">Fase da Vida</CardTitle>
            <div className="text-2xl font-bold text-white">{scores.lifeCycle}%</div>
          </CardHeader>
          <CardContent>
            <Progress value={scores.lifeCycle} className="mb-4" />
            <p className="text-sm text-teal-200">
              Vocês estão {scores.lifeCycle >= 70 ? 'em harmonia' : 'aprendendo juntos'}.
            </p>
          </CardContent>
        </Card>
      </div>

      <CompatibilityRadarChart result={result} />


      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Comparação de Perfis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-purple-500/20 rounded-lg">
              <h3 className="font-semibold text-purple-300 mb-3 text-lg">{person1.name}</h3>
              <div className="space-y-2 text-white">
                <p className="text-sm">Alma: <span className="font-bold">{numbers.person1.soul}</span></p>
                <p className="text-sm">Destino: <span className="font-bold">{numbers.person1.destiny}</span></p>
                <p className="text-sm">Talento: <span className="font-bold">{numbers.person1.talent}</span></p>
                <p className="text-sm">Ciclo: <span className="font-bold">{numbers.person1.currentCycle}</span></p>
              </div>
            </div>
            <div className="p-4 bg-pink-500/20 rounded-lg">
              <h3 className="font-semibold text-pink-300 mb-3 text-lg">{person2.name}</h3>
              <div className="space-y-2 text-white">
                <p className="text-sm">Alma: <span className="font-bold">{numbers.person2.soul}</span></p>
                <p className="text-sm">Destino: <span className="font-bold">{numbers.person2.destiny}</span></p>
                <p className="text-sm">Talento: <span className="font-bold">{numbers.person2.talent}</span></p>
                <p className="text-sm">Ciclo: <span className="font-bold">{numbers.person2.currentCycle}</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
