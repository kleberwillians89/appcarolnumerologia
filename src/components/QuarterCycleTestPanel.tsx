import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { calculateQuarterCycles, calculateDestinyPath, calculateChallenges } from '@/utils/numerologyCalculations2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import HistoricalAnalysisPanel from './HistoricalAnalysisPanel';


interface TestResult {
  date: string;
  cycles: number[];
  destinyPath: number;
  hasZero: boolean;
  challenges: { first: number; second: number; major: number };
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export default function QuarterCycleTestPanel() {
  const [testDate, setTestDate] = useState('01/01/1990');
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [batchResults, setBatchResults] = useState<TestResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [yearRange, setYearRange] = useState({ start: 1950, end: 2050 });

  const parseDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return {
      day: parseInt(parts[0]),
      month: parseInt(parts[1]),
      year: parseInt(parts[2])
    };
  };

  const testSingleDate = () => {
    const parsed = parseDate(testDate);
    if (!parsed) return;

    const cycles = calculateQuarterCycles(parsed.day, parsed.month, parsed.year);
    const destinyPath = calculateDestinyPath(parsed.day, parsed.month, parsed.year);
    const challenges = calculateChallenges(parsed.day, parsed.month, parsed.year);

    setCurrentResult({
      date: testDate,
      cycles,
      destinyPath,
      hasZero: cycles.includes(0),
      challenges: {
        first: challenges.first.value,
        second: challenges.second.value,
        major: challenges.major.value
      }
    });
  };

  const generateBatchTests = () => {
    setIsGenerating(true);
    const results: TestResult[] = [];
    
    setTimeout(() => {
      for (let year = yearRange.start; year <= yearRange.end; year++) {
        for (let month = 1; month <= 12; month++) {
          const daysInMonth = new Date(year, month, 0).getDate();
          for (let day = 1; day <= daysInMonth; day++) {
            const cycles = calculateQuarterCycles(day, month, year);
            const destinyPath = calculateDestinyPath(day, month, year);
            const challenges = calculateChallenges(day, month, year);
            
            if (cycles.includes(0)) {
              results.push({
                date: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`,
                cycles,
                destinyPath,
                hasZero: true,
                challenges: {
                  first: challenges.first.value,
                  second: challenges.second.value,
                  major: challenges.major.value
                }
              });
            }
          }
        }
      }
      
      setBatchResults(results);
      setIsGenerating(false);
    }, 100);
  };

  const getDistributionData = () => {
    const distribution: Record<number, number> = {};
    for (let i = 0; i <= 22; i++) distribution[i] = 0;

    batchResults.forEach(result => {
      result.cycles.forEach(cycle => {
        distribution[cycle] = (distribution[cycle] || 0) + 1;
      });
    });

    return Object.entries(distribution)
      .filter(([_, count]) => count > 0)
      .map(([num, count]) => ({
        number: num === '0' ? 'Zero' : num,
        count,
        percentage: ((count / (batchResults.length * 4)) * 100).toFixed(2)
      }))
      .sort((a, b) => parseInt(a.number === 'Zero' ? '0' : a.number) - parseInt(b.number === 'Zero' ? '0' : b.number));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel de Testes - Ciclos Trimestrais</CardTitle>
          <CardDescription>
            Teste diferentes datas e visualize quando ocorrem ciclos com número 0 (raro: ~1 a cada 9 anos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="single">Teste Individual</TabsTrigger>
              <TabsTrigger value="batch">Análise em Lote</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              <TabsTrigger value="historical">Análise Histórica</TabsTrigger>
            </TabsList>


            <TabsContent value="single" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="testDate">Data de Nascimento (DD/MM/AAAA)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="testDate"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      placeholder="01/01/1990"
                    />
                    <Button onClick={testSingleDate}>Testar</Button>
                  </div>
                </div>

                {currentResult && (
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Resultado para {currentResult.date}</h3>
                        <p className="text-sm text-muted-foreground">Caminho de Destino: {currentResult.destinyPath}</p>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        {currentResult.cycles.map((cycle, idx) => (
                          <div key={idx} className="text-center">
                            <div className={`text-3xl font-bold ${cycle === 0 ? 'text-red-600' : 'text-purple-600'}`}>
                              {cycle}
                            </div>
                            <div className="text-xs text-muted-foreground">Trimestre {idx + 1}</div>
                          </div>
                        ))}
                      </div>

                      {currentResult.hasZero && (
                        <Alert className="bg-red-50 border-red-200">
                          <AlertDescription className="text-red-800">
                            <strong>Ciclo Raro Detectado!</strong> Esta data contém trimestre(s) com número 0.
                            {currentResult.challenges.first === 0 || currentResult.challenges.second === 0 || currentResult.challenges.major === 0
                              ? ' Há também desafio com 0 no mapa.'
                              : ' Não há desafio com 0 no mapa.'}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Desafios</h4>
                        <div className="flex gap-4">
                          <Badge variant={currentResult.challenges.first === 0 ? 'destructive' : 'secondary'}>
                            1º: {currentResult.challenges.first}
                          </Badge>
                          <Badge variant={currentResult.challenges.second === 0 ? 'destructive' : 'secondary'}>
                            2º: {currentResult.challenges.second}
                          </Badge>
                          <Badge variant={currentResult.challenges.major === 0 ? 'destructive' : 'secondary'}>
                            Maior: {currentResult.challenges.major}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ano Inicial</Label>
                    <Input
                      type="number"
                      value={yearRange.start}
                      onChange={(e) => setYearRange(prev => ({ ...prev, start: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Ano Final</Label>
                    <Input
                      type="number"
                      value={yearRange.end}
                      onChange={(e) => setYearRange(prev => ({ ...prev, end: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button onClick={generateBatchTests} disabled={isGenerating} className="w-full">
                  {isGenerating ? 'Gerando...' : 'Gerar Análise em Lote'}
                </Button>

                {batchResults.length > 0 && (
                  <Alert>
                    <AlertDescription>
                      Encontradas <strong>{batchResults.length}</strong> datas com ciclo 0 
                      no período de {yearRange.end - yearRange.start + 1} anos.
                      <br />
                      Taxa de ocorrência: <strong>{((batchResults.length / ((yearRange.end - yearRange.start + 1) * 365.25)) * 100).toFixed(2)}%</strong>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {batchResults.slice(0, 50).map((result, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono">{result.date}</span>
                        <div className="flex gap-2">
                          {result.cycles.map((c, i) => (
                            <Badge key={i} variant={c === 0 ? 'destructive' : 'outline'}>
                              T{i + 1}: {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {batchResults.length > 50 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... e mais {batchResults.length - 50} resultados
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              {batchResults.length > 0 ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Números nos Ciclos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getDistributionData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="number" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Raridade do Zero</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-purple-600">
                          {((batchResults.length / ((yearRange.end - yearRange.start + 1) * 365.25)) * 100).toFixed(3)}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Aproximadamente 1 a cada {Math.round(365.25 / (batchResults.length / (yearRange.end - yearRange.start + 1)))} dias
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Total de Ocorrências</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-pink-600">
                          {batchResults.length}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Datas com pelo menos um ciclo 0
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    Execute uma análise em lote para visualizar as estatísticas.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="historical" className="space-y-4">
              <HistoricalAnalysisPanel />
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>
    </div>
  );
}
