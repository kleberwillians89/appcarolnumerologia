import { useRef, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SavedProfile } from '@/utils/profileStorage';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportChartAsImage } from '@/utils/chartExport';

interface Props {
  profiles: SavedProfile[];
}

const COLORS = ['#eab308', '#ec4899', '#3b82f6', '#10b981', '#f97316'];

export default function ComparisonTimelineChart({ profiles }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
    return (
      <div className="bg-slate-800/50 p-4 md:p-6 rounded-lg text-center text-slate-400 text-sm md:text-base">
        Nenhum perfil disponível para comparação
      </div>
    );
  }
  
  const cycles = ['cycle1', 'cycle2', 'cycle3'];
  const labels = { cycle1: 'Ciclo 1', cycle2: 'Ciclo 2', cycle3: 'Ciclo 3' };

  const data = cycles.map(cy => {
    const point: any = { cycle: labels[cy as keyof typeof labels] };
    profiles.forEach((profile, idx) => {
      point[`profile${idx}`] = profile?.results?.lifeCycles?.[cy]?.value || 0;
    });
    return point;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-yellow-500/30 rounded-lg p-2 md:p-4 shadow-xl">
          <p className="text-yellow-500 font-bold mb-1 text-xs md:text-sm">{payload[0].payload.cycle}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-slate-200 text-xs" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    exportChartAsImage(chartRef, 'comparacao-ciclos');
  };

  const height = isMobile ? 280 : 400;
  const fontSize = isMobile ? 10 : 12;
  const strokeWidth = isMobile ? 2 : 3;
  const dotRadius = isMobile ? 4 : 6;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-base md:text-xl font-semibold text-white">Linha do Tempo dos Ciclos de Vida</h3>
        <Button onClick={handleExport} size="sm" variant="outline" className="text-xs md:text-sm">
          <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
          Exportar
        </Button>
      </div>
      <div ref={chartRef} className="bg-slate-800/50 p-3 md:p-6 rounded-lg">
        <div className={isMobile ? 'overflow-x-auto' : ''}>
          <div className={isMobile ? 'min-w-[400px]' : ''}>
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="cycle" tick={{ fill: '#cbd5e1', fontSize }} />
                <YAxis domain={[0, 11]} tick={{ fill: '#cbd5e1', fontSize }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: isMobile ? 10 : 12 }} layout="horizontal" align="center" verticalAlign="bottom" />
                {profiles.map((profile, idx) => (
                  <Line key={profile.id} name={profile.profileName} type="monotone" dataKey={`profile${idx}`} stroke={COLORS[idx]} strokeWidth={strokeWidth} dot={{ r: dotRadius, fill: COLORS[idx] }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
