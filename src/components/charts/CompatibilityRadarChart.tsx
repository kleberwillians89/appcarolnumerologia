import { useRef, useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { CompatibilityResult } from '@/utils/compatibilityCalculations';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportChartAsImage } from '@/utils/chartExport';

interface Props {
  result: CompatibilityResult;
}

export default function CompatibilityRadarChart({ result }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const data = [
    { dimension: 'Alma', score: result.scores.soul, person1: result.numbers.person1.soul, person2: result.numbers.person2.soul },
    { dimension: 'Destino', score: result.scores.destiny, person1: result.numbers.person1.destiny, person2: result.numbers.person2.destiny },
    { dimension: 'Talento', score: result.scores.talent, person1: result.numbers.person1.talent, person2: result.numbers.person2.talent },
    { dimension: 'Ciclo de Vida', score: result.scores.lifeCycle, person1: result.numbers.person1.currentCycle, person2: result.numbers.person2.currentCycle }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-purple-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-purple-300 font-bold mb-1 text-xs md:text-sm">{payload[0].payload.dimension}</p>
          <p className="text-purple-400 text-xs">Compatibilidade: <span className="font-bold">{payload[0].value}%</span></p>
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    exportChartAsImage(chartRef, 'compatibilidade-radar');
  };

  const height = isMobile ? 280 : 400;
  const fontSize = isMobile ? 10 : 14;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-lg md:text-xl font-semibold text-white">Análise Visual de Compatibilidade</h3>
        <Button onClick={handleExport} size="sm" variant="outline" className="text-xs md:text-sm">
          <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
          Exportar
        </Button>
      </div>
      <div ref={chartRef} className="bg-slate-800/50 p-3 md:p-6 rounded-lg">
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={data}>
            <PolarGrid stroke="#6b21a8" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#e9d5ff', fontSize }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#c084fc', fontSize: fontSize - 2 }} />
            <Tooltip content={<CustomTooltip />} />
            <Radar name="Compatibilidade" dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} strokeWidth={2} />
            <Legend wrapperStyle={{ color: '#e9d5ff', fontSize: isMobile ? 11 : 14 }} layout="horizontal" align="center" verticalAlign="bottom" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
