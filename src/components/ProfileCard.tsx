import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Calendar, Clock, FileText, Edit, Share2, Download } from 'lucide-react';

import { ProfilePdfStatus, SavedProfile } from '@/utils/profileStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { formatDateBR } from '@/utils/dateUtils';

interface ProfileCardProps {
  profile: SavedProfile;
  onLoad: (profile: SavedProfile) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (profile: SavedProfile) => void;
  onGeneratePdf: (profile: SavedProfile) => void;
  onDownloadPdf: (profile: SavedProfile) => void;
  onStatusChange: (profile: SavedProfile, status: ProfilePdfStatus) => void;
  onShare?: (profile: SavedProfile) => void;
  isGeneratingPdf?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLoad,
  onDelete,
  onToggleFavorite,
  onEdit,
  onGeneratePdf,
  onDownloadPdf,
  onStatusChange,
  onShare,
  isGeneratingPdf = false,
}) => {

  const typeLabels = {
    numerology: 'Numerologia',
    compatibility: 'Compatibilidade',
    personalYear: 'Ano Pessoal',
  };
  const status = profile.pdfStatus || 'PENDENTE';
  const statusLabels: Record<ProfilePdfStatus, string> = {
    PENDENTE: 'Pendente',
    EM_ANALISE: 'Em analise',
    PDF_GERADO: 'PDF gerado',
    ENVIADO: 'Enviado',
    ERRO: 'Erro',
  };
  const statusVariants: Record<ProfilePdfStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDENTE: 'outline',
    EM_ANALISE: 'secondary',
    PDF_GERADO: 'default',
    ENVIADO: 'secondary',
    ERRO: 'destructive',
  };
  const hasPdf = Boolean(profile.pdfDataUrl);

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
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{typeLabels[profile.type]}</Badge>
          <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 text-sm">
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
            <p className="mt-1 font-medium">{statusLabels[status]}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Arquivo/PDF</p>
            <p className="mt-1 truncate font-medium">{hasPdf ? 'PDF gerado' : 'Ainda não gerado'}</p>
          </div>
        </div>
        {profile.pdfGeneratedAt && (
          <p className="text-xs text-muted-foreground">
            PDF gerado em {new Date(profile.pdfGeneratedAt).toLocaleString('pt-BR')}
          </p>
        )}
        {profile.pdfSentAt && (
          <p className="text-xs text-muted-foreground">
            Envio simulado em {new Date(profile.pdfSentAt).toLocaleString('pt-BR')}
          </p>
        )}
        {profile.pdfError && (
          <p className="text-xs text-red-600">{profile.pdfError}</p>
        )}
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
      <CardFooter className="flex-col items-stretch gap-3">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onLoad(profile)}>
            Carregar
          </Button>
          <Button
            variant="outline"
            onClick={() => onGeneratePdf(profile)}
            disabled={isGeneratingPdf}
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}
          </Button>
          {hasPdf && (
            <Button variant="outline" onClick={() => onDownloadPdf(profile)}>
              Baixar PDF
            </Button>
          )}
          {onShare && (
            <Button variant="outline" onClick={() => onShare(profile)}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`profile-status-${profile.id}`}>
            Atualizar status
          </label>
          <select
            id={`profile-status-${profile.id}`}
            value={status}
            onChange={(event) => onStatusChange(profile, event.target.value as ProfilePdfStatus)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PENDENTE">Dados recebidos / Pendente</option>
            <option value="EM_ANALISE">Em analise</option>
            <option value="EM_ANALISE">Pronto para gerar PDF</option>
            <option value="PDF_GERADO">PDF gerado</option>
            <option value="ENVIADO">Enviado</option>
            <option value="ERRO">Erro</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(profile)} title="Editar perfil">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => onDelete(profile.id)} title="Excluir perfil">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
