import { SavedProfile } from '@/utils/profileStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Star } from 'lucide-react';
import ChallengesBarChart from '@/components/charts/ChallengesBarChart';

export default function ChallengesComparison({ profiles }: { profiles: SavedProfile[] }) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-red-500" />
            Gráfico de Barras - Desafios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChallengesBarChart profiles={profiles} type="challenges" />
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="h-5 w-5 text-green-500" />
            Gráfico de Barras - Presentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChallengesBarChart profiles={profiles} type="presents" />
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-yellow-500" />
            Detalhes Completos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map(profile => (
              <div key={profile.id} className="p-4 bg-slate-700/30 rounded-lg">
                <h4 className="font-semibold text-yellow-500 mb-3">{profile.profileName}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Desafios</h5>
                    <div className="space-y-2">
                      {profile.data?.challenges && Object.entries(profile.data.challenges).map(([key, challenge]: [string, any]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                          <span className="text-xs text-slate-400">{challenge.label}</span>
                          <Badge className="bg-red-500/20 text-red-400">{challenge.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Presentes</h5>
                    <div className="space-y-2">
                      {profile.data?.presents && Object.entries(profile.data.presents).map(([key, present]: [string, any]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                          <span className="text-xs text-slate-400">{present.label}</span>
                          <Badge className="bg-green-500/20 text-green-400">{present.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
