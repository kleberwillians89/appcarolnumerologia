import { useRef, useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { SavedProfile } from '@/utils/profileStorage';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportChartAsImage } from '@/utils/chartExport';

interface Props {
  profiles: SavedProfile[];
}

const COLORS = ['#eab308', '#ec4899', '#3b82f6', '#10b981', '#f97316'];

export default function ComparisonRadarChart({ profiles }: Props) {
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
  
  const numbers = ['soul', 'destiny', 'dom', 'talent', 'dream'];
  const labels = { soul: 'Alma', destiny: 'Destino', dom: 'Dom', talent: 'Talento', dream: 'Sonho' };

  const data = numbers.map(num => {
    const point: any = { number: labels[num as keyof typeof labels] };
    profiles.forEach((profile, idx) => {
      point[`profile${idx}`] = profile?.results?.[num] || 0;
    });
    return point;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-yellow-500/30 rounded-lg p-2 md:p-4 shadow-xl">
          <p className="text-yellow-500 font-bold mb-1 text-xs md:text-sm">{payload[0].payload.number}</p>
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
    exportChartAsImage(chartRef, 'comparacao-radar');
  };

  const height = isMobile ? 300 : 450;
  const fontSize = isMobile ? 10 : 14;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-lg md:text-xl font-semibold text-white">Comparação de Números Numerológicos</h3>
        <Button onClick={handleExport} size="sm" variant="outline" className="border-slate-500 bg-slate-900/40 text-xs text-slate-100 hover:bg-slate-700 hover:text-white md:text-sm">
          <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
          Exportar
        </Button>
      </div>
      <div ref={chartRef} className="bg-slate-800/50 p-3 md:p-6 rounded-lg">
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={data}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis dataKey="number" tick={{ fill: '#cbd5e1', fontSize }} />
            <PolarRadiusAxis angle={90} domain={[0, 11]} tick={{ fill: '#94a3b8', fontSize: fontSize - 2 }} />
            <Tooltip content={<CustomTooltip />} />
            {profiles.map((profile, idx) => (
              <Radar key={profile.id} name={profile.profileName} dataKey={`profile${idx}`} stroke={COLORS[idx]} fill={COLORS[idx]} fillOpacity={0.3} strokeWidth={2} />
            ))}
            <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: isMobile ? 10 : 12 }} layout="horizontal" align="center" verticalAlign="bottom" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
