import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedProfile } from '@/utils/shareProfileUtils';
import { Card } from '@/components/ui/card';
import { formatDateBR } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Lock } from 'lucide-react';


export const SharedProfileView = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shareId) {
      const sharedProfile = getSharedProfile(shareId);
      if (sharedProfile) {
        setProfile(sharedProfile.profile);
      }
      setLoading(false);
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <p className="text-lg">Carregando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Perfil não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            Este link pode ter expirado ou o perfil foi removido.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </Card>
      </div>
    );
  }

  const { userData, results, lifeCycles, challenges, presents } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2 text-amber-600">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Perfil Compartilhado (Visualização)</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2">{userData.name}</h1>
          <p className="text-center text-muted-foreground">
            {formatDateBR(userData.birthDate)}
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Resultados Numerológicos</h2>
          <div className="grid gap-4">
            {results && Object.entries(results).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">{key}</span>
                <span className="text-2xl font-bold text-purple-600">{value as number}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};
