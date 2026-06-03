import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { SavedProfile } from '@/utils/profileStorage';
import { useEffect, useState } from 'react';

interface Props {
  profiles: SavedProfile[];
}

const COLORS = ['#eab308', '#ec4899', '#3b82f6', '#10b981', '#f97316'];

export default function NumerologyRadarChart({ profiles }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const numbers = ['soul', 'destiny', 'dom', 'talent', 'dream'];
  const labels = { soul: 'Alma', destiny: 'Destino', dom: 'Dom', talent: 'Talento', dream: 'Sonho' };

  const data = numbers.map(num => {
    const point: any = { number: labels[num as keyof typeof labels] };
    profiles.forEach((profile, idx) => {
      point[`profile${idx}`] = profile.results?.[num] || 0;
    });
    return point;
  });

  const height = isMobile ? 300 : 400;
  const fontSize = isMobile ? 10 : 12;
  const legendLayout = isMobile ? 'horizontal' : 'horizontal';
  const legendAlign = isMobile ? 'center' : 'center';
  const legendVerticalAlign = isMobile ? 'bottom' : 'bottom';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="#475569" />
        <PolarAngleAxis dataKey="number" tick={{ fill: '#cbd5e1', fontSize }} />
        <PolarRadiusAxis angle={90} domain={[0, 11]} tick={{ fill: '#94a3b8', fontSize: fontSize - 1 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: isMobile ? 11 : 14 }}
          labelStyle={{ color: '#eab308', fontWeight: 'bold' }}
        />
        {profiles.map((profile, idx) => (
          <Radar
            key={profile.id}
            name={profile.profileName}
            dataKey={`profile${idx}`}
            stroke={COLORS[idx]}
            fill={COLORS[idx]}
            fillOpacity={0.3}
          />
        ))}
        <Legend 
          wrapperStyle={{ color: '#cbd5e1', fontSize: isMobile ? 11 : 14 }} 
          layout={legendLayout}
          align={legendAlign}
          verticalAlign={legendVerticalAlign}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
