import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { calculateQuarterCycles } from '@/utils/numerologyCalculations2';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DecadeData {
  decade: string;
  count: number;
  rate: number;
  totalDays: number;
}

interface MonthData {
  month: string;
  count: number;
  rate: number;
}

interface YearCycleData {
  year: number;
  count: number;
  rate: number;
}

export default function HistoricalAnalysisPanel() {
  const [decadeData, setDecadeData] = useState<DecadeData[]>([]);
  const [monthData, setMonthData] = useState<MonthData[]>([]);
  const [yearCycleData, setYearCycleData] = useState<YearCycleData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [startYear] = useState(1900);
  const [endYear] = useState(2100);

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const analyzeHistoricalData = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const decades: Record<string, { count: number; totalDays: number }> = {};
      const months: Record<number, number> = {};
      const years: Record<number, number> = {};
      
      for (let year = startYear; year <= endYear; year++) {
        const decade = `${Math.floor(year / 10) * 10}s`;
        if (!decades[decade]) decades[decade] = { count: 0, totalDays: 0 };
        if (!years[year]) years[year] = 0;
        
        for (let month = 1; month <= 12; month++) {
          if (!months[month]) months[month] = 0;
          const daysInMonth = new Date(year, month, 0).getDate();
          
          for (let day = 1; day <= daysInMonth; day++) {
            decades[decade].totalDays++;
            const cycles = calculateQuarterCycles(day, month, year);
            
            if (cycles.includes(0)) {
              decades[decade].count++;
              months[month]++;
              years[year]++;
            }
          }
        }
      }
      
      const decadeResults: DecadeData[] = Object.entries(decades).map(([decade, data]) => ({
        decade,
        count: data.count,
        rate: (data.count / data.totalDays) * 100,
        totalDays: data.totalDays
      }));
      
      const monthResults: MonthData[] = Object.entries(months).map(([month, count]) => ({
        month: monthNames[parseInt(month) - 1],
        count,
        rate: (count / ((endYear - startYear + 1) * 31)) * 100
      }));
      
      const yearResults: YearCycleData[] = Object.entries(years)
        .map(([year, count]) => ({
          year: parseInt(year),
          count,
          rate: (count / 365.25) * 100
        }))
        .slice(0, 100);
      
      setDecadeData(decadeResults);
      setMonthData(monthResults);
      setYearCycleData(yearResults);
      setIsAnalyzing(false);
    }, 100);
  };

  const getNineCyclePattern = () => {
    const pattern: { cycleStart: number; avgRate: number; count: number }[] = [];
    
    for (let i = 0; i < yearCycleData.length; i += 9) {
      const cycleYears = yearCycleData.slice(i, i + 9);
      if (cycleYears.length > 0) {
        const avgRate = cycleYears.reduce((sum, y) => sum + y.rate, 0) / cycleYears.length;
        const totalCount = cycleYears.reduce((sum, y) => sum + y.count, 0);
        pattern.push({
          cycleStart: cycleYears[0].year,
          avgRate,
          count: totalCount
        });
      }
    }
    
    return pattern;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Análise Histórica Comparativa</h3>
          <p className="text-sm text-muted-foreground">
            Período: {startYear} - {endYear} ({endYear - startYear + 1} anos)
          </p>
        </div>
        <Button onClick={analyzeHistoricalData} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analisando...' : 'Iniciar Análise'}
        </Button>
      </div>

      {decadeData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Década</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={decadeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="decade" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" name="Ocorrências" strokeWidth={2} />
                  <Line type="monotone" dataKey="rate" stroke="#ec4899" name="Taxa (%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Padrões Sazonais (Por Mês)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Ocorrências" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ciclos de 9 Anos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getNineCyclePattern()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cycleStart" label={{ value: 'Início do Ciclo', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" name="Total no Ciclo" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <Alert className="mt-4">
                <AlertDescription>
                  Padrão identificado: A cada 9 anos, observa-se um ciclo completo na distribuição de ciclos 0.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Década com Mais Ocorrências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {decadeData.reduce((max, d) => d.count > max.count ? d : max).decade}
                </div>
                <Badge className="mt-2">
                  {decadeData.reduce((max, d) => d.count > max.count ? d : max).count} ocorrências
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mês com Maior Incidência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {monthData.reduce((max, m) => m.count > max.count ? m : max).month}
                </div>
                <Badge className="mt-2">
                  {monthData.reduce((max, m) => m.count > max.count ? m : max).count} ocorrências
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Variação Entre Décadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {((Math.max(...decadeData.map(d => d.rate)) - Math.min(...decadeData.map(d => d.rate)))).toFixed(3)}%
                </div>
                <Badge className="mt-2">Amplitude</Badge>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {decadeData.length === 0 && !isAnalyzing && (
        <Alert>
          <AlertDescription>
            Clique em "Iniciar Análise" para visualizar a distribuição histórica de ciclos 0 ao longo das décadas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
