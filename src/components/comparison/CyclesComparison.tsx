import { SavedProfile } from '@/utils/profileStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';
import LifeCyclesLineChart from '@/components/charts/LifeCyclesLineChart';

export default function CyclesComparison({ profiles }: { profiles: SavedProfile[] }) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
            Gráfico de Linha - Ciclos de Vida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LifeCyclesLineChart profiles={profiles} />
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-yellow-500" />
            Detalhes dos Ciclos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map(profile => (
              <div key={profile.id} className="p-4 bg-slate-700/30 rounded-lg">
                <h4 className="font-semibold text-yellow-500 mb-3">{profile.profileName}</h4>
                <div className="grid grid-cols-3 gap-3">
                  {profile.data?.lifeCycles && Object.entries(profile.data.lifeCycles).map(([key, cycle]: [string, any]) => (
                    <div key={key} className="text-center p-3 bg-slate-800/50 rounded">
                      <div className="text-2xl font-bold text-yellow-500">{cycle.value}</div>
                      <div className="text-xs text-slate-400 mt-1">{cycle.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{cycle.age}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
