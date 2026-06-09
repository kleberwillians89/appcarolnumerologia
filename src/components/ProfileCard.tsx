import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Calendar, Clock, FileText, Edit, Share2 } from 'lucide-react';

import { SavedProfile } from '@/utils/profileStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { formatDateBR } from '@/utils/dateUtils';

interface ProfileCardProps {
  profile: SavedProfile;
  onLoad: (profile: SavedProfile) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (profile: SavedProfile) => void;
  onShare?: (profile: SavedProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLoad,
  onDelete,
  onToggleFavorite,
  onEdit,
  onShare,
}) => {

  const typeLabels = {
    numerology: 'Numerologia',
    compatibility: 'Compatibilidade',
    personalYear: 'Ano Pessoal',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{profile.profileName}</h3>
            <p className="text-sm text-muted-foreground">{profile.name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(profile.id)}
            className="ml-2"
          >
            <Star className={`w-4 h-4 ${profile.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{formatDateBR(profile.birthDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{format(new Date(profile.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
        </div>
        <Badge variant="secondary">{typeLabels[profile.type]}</Badge>
        {profile.tags && profile.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {profile.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {profile.notes && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
            <FileText className="w-4 h-4 mt-0.5" />
            <p className="line-clamp-2">{profile.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={() => onLoad(profile)} className="flex-1">
          Carregar
        </Button>
        {onShare && (
          <Button variant="outline" size="icon" onClick={() => onShare(profile)}>
            <Share2 className="w-4 h-4" />
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={() => onEdit(profile)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => onDelete(profile.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
