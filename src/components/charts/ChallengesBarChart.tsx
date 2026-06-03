import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SavedProfile } from '@/utils/profileStorage';

interface Props {
  profiles: SavedProfile[];
  type: 'challenges' | 'presents';
}

const COLORS = ['#eab308', '#ec4899', '#3b82f6', '#10b981', '#f97316'];

export default function ChallengesBarChart({ profiles, type }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const keys = ['challenge1', 'challenge2', 'challenge3', 'challenge4'];
  const labels = ['1º', '2º', '3º', '4º'];

  const data = keys.map((key, idx) => {
    const point: any = { name: labels[idx] };
    profiles.forEach((profile, pIdx) => {
      const value = type === 'challenges' 
        ? profile.data?.challenges?.[key]?.value 
        : profile.data?.presents?.[key]?.value;
      point[`profile${pIdx}`] = value || 0;
    });
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 md:p-3">
          <p className="text-yellow-500 font-bold mb-1 text-xs md:text-sm">{type === 'challenges' ? 'Desafio' : 'Presente'} {label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const height = isMobile ? 250 : 300;
  const fontSize = isMobile ? 10 : 12;

  return (
    <div className={isMobile ? 'overflow-x-auto' : ''}>
      <div className={isMobile ? 'min-w-[400px]' : ''}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fontSize }} />
            <YAxis domain={[0, 11]} stroke="#cbd5e1" tick={{ fontSize }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: isMobile ? 10 : 12 }} layout="horizontal" align="center" verticalAlign="bottom" />
            {profiles.map((profile, idx) => (
              <Bar key={profile.id} dataKey={`profile${idx}`} name={profile.profileName} fill={COLORS[idx]} radius={[8, 8, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
