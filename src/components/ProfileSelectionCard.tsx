import { SavedProfile, toggleFavorite } from '@/utils/profileStorage';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Calendar, User, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface ProfileSelectionCardProps {
  profile: SavedProfile;
  isSelected: boolean;
  onSelect: () => void;
  viewMode: 'grid' | 'list';
  onFavoriteToggle: () => void;
}

export default function ProfileSelectionCard({
  profile,
  isSelected,
  onSelect,
  viewMode,
  onFavoriteToggle,
}: ProfileSelectionCardProps) {
  const formattedDate = format(new Date(profile.timestamp), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  if (viewMode === 'list') {
    return (
      <Card 
        className={`cursor-pointer transition-all ${
          isSelected 
            ? 'bg-yellow-500/20 border-yellow-500' 
            : 'bg-slate-800/50 border-slate-700 hover:border-yellow-500/50'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {isSelected && <Check className="h-5 w-5 text-yellow-500" />}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white">{profile.profileName}</h4>
                  {profile.favorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {profile.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formattedDate}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">
                  {profile.results?.soul || '-'}
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  {profile.results?.destiny || '-'}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className="ml-2"
            >
              <Star className={`h-4 w-4 ${profile.favorite ? 'fill-current text-yellow-500' : 'text-slate-400'}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? 'bg-yellow-500/20 border-yellow-500' 
          : 'bg-slate-800/50 border-slate-700 hover:border-yellow-500/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          {isSelected && <Check className="h-5 w-5 text-yellow-500" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            className="ml-auto -mt-1 -mr-1"
          >
            <Star className={`h-4 w-4 ${profile.favorite ? 'fill-current text-yellow-500' : 'text-slate-400'}`} />
          </Button>
        </div>
        <h4 className="font-semibold text-white mb-2">{profile.profileName}</h4>
        <p className="text-sm text-slate-400 mb-3">{profile.name}</p>
        <div className="flex gap-2 mb-3">
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">
            Alma: {profile.results?.soul || '-'}
          </Badge>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
            Destino: {profile.results?.destiny || '-'}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
}
