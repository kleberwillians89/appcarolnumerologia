import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SavedProfile } from '@/utils/profileStorage';

interface Props {
  profiles: SavedProfile[];
}

const COLORS = ['#eab308', '#ec4899', '#3b82f6', '#10b981', '#f97316'];

export default function LifeCyclesLineChart({ profiles }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cycleKeys = ['cycle1', 'cycle2', 'cycle3'];
  const cycleLabels = ['1º Ciclo', '2º Ciclo', '3º Ciclo'];

  const data = cycleKeys.map((key, idx) => {
    const point: any = { name: cycleLabels[idx] };
    profiles.forEach((profile, pIdx) => {
      const cycle = profile.data?.lifeCycles?.[key];
      point[`profile${pIdx}`] = cycle?.value || 0;
      point[`profile${pIdx}Age`] = cycle?.age || '';
    });
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 md:p-3">
          <p className="text-yellow-500 font-bold mb-1 text-xs md:text-sm">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value} {entry.payload[`${entry.dataKey}Age`] && `(${entry.payload[`${entry.dataKey}Age`]})`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const height = isMobile ? 280 : 350;
  const fontSize = isMobile ? 10 : 12;
  const strokeWidth = isMobile ? 2 : 3;
  const dotRadius = isMobile ? 4 : 6;

  return (
    <div className={isMobile ? 'overflow-x-auto' : ''}>
      <div className={isMobile ? 'min-w-[400px]' : ''}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fontSize }} />
            <YAxis domain={[0, 11]} stroke="#cbd5e1" tick={{ fontSize }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: isMobile ? 10 : 12 }} layout="horizontal" align="center" verticalAlign="bottom" />
            {profiles.map((profile, idx) => (
              <Line key={profile.id} type="monotone" dataKey={`profile${idx}`} name={profile.profileName} stroke={COLORS[idx]} strokeWidth={strokeWidth} dot={{ r: dotRadius, fill: COLORS[idx] }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
