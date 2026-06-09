import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Copy,
  Download,
  Edit,
  Eye,
  FileText,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  Phone,
  Share2,
  Star,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { getProductConfiguredName, getProductMaterials } from '@/config/productMaterials';
import { premiumClasses } from '@/config/premiumClasses';
import { generatePdfForProduct, PdfProductKey } from '@/services/pdfDeliveryService';
import { pdfStorageService } from '@/services/pdfStorageService';
import { formatDateBR } from '@/utils/dateUtils';
import { formatBrazilianPhone, isValidBrazilianPhone, normalizeBrazilianPhone } from '@/utils/phoneUtils';
import { ProfilePdfStatus, SavedProfile } from '@/utils/profileStorage';
import { generateShareUrlForProfile, saveSharedProfile } from '@/utils/shareProfileUtils';
import { useToast } from '@/hooks/use-toast';

interface ProfileCardProps {
  profile: SavedProfile;
  onLoad: (profile: SavedProfile) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (profile: SavedProfile) => void;
  onShare?: (profile: SavedProfile) => void;
  onUpdate?: (id: string, updates: Partial<SavedProfile>) => void;
}

const statusLabels: Record<ProfilePdfStatus, string> = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Análise manual',
  PDF_GERADO: 'PDF gerado',
  ENVIADO: 'Enviado',
  ERRO: 'Erro',
};

const statusClassName: Record<ProfilePdfStatus, string> = {
  PENDENTE: 'bg-yellow-500/15 text-yellow-100 border-yellow-500/30',
  EM_ANALISE: 'bg-orange-500/15 text-orange-200 border-orange-500/30',
  PDF_GERADO: 'bg-blue-500/15 text-blue-200 border-blue-500/30',
  ENVIADO: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  ERRO: 'bg-red-500/15 text-red-200 border-red-500/30',
};

const statusOptions: ProfilePdfStatus[] = ['PENDENTE', 'EM_ANALISE', 'PDF_GERADO', 'ENVIADO', 'ERRO'];

const typeLabels = {
  numerology: 'Numerologia',
  compatibility: 'Compatibilidade',
  personalYear: 'Ano Pessoal',
};

const getProfileStatus = (profile: SavedProfile): ProfilePdfStatus => {
  if (profile.pdfStatus) return profile.pdfStatus;
  if (profile.pdfPublicUrl || profile.pdfDataUrl) return 'PDF_GERADO';
  return 'EM_ANALISE';
};

const getProductKey = (profile: SavedProfile): PdfProductKey => {
  if (profile.type === 'personalYear') return 'ano_pessoal';
  return 'mapa';
};

const formatDateTime = (timestamp?: number | string | null) => {
  if (!timestamp) return 'Não informado';
  return format(new Date(timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

const downloadPdfDataUrl = (dataUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};

const getPublicPdfLabel = (profile: SavedProfile) => {
  if (profile.pdfPublicUrl) return profile.pdfFileName || 'PDF público disponível';
  if (profile.pdfDataUrl) return 'PDF local gerado. Gere novamente para publicar.';
  return 'Ainda não gerado';
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLoad,
  onDelete,
  onToggleFavorite,
  onEdit,
  onShare,
  onUpdate,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();

  const status = getProfileStatus(profile);
  const productKey = getProductKey(profile);
  const productName = getProductConfiguredName(productKey);
  const materials = useMemo(() => getProductMaterials(productKey), [productKey]);
  const materialLinks = materials.filter((material) => material.url);
  const hasPhone = Boolean(profile.phone && isValidBrazilianPhone(profile.phone));
  const hasPublicPdf = Boolean(profile.pdfPublicUrl);
  const hasShareUrl = Boolean(profile.shareUrl);
  const hasMaterials = materialLinks.length > 0;
  const canSendWhatsApp = hasPhone && hasPublicPdf && hasShareUrl;
  const linkItems = [
    ...(profile.shareUrl ? [`Página compartilhada: ${profile.shareUrl}`] : []),
    ...(profile.pdfPublicUrl ? [`PDF: ${profile.pdfPublicUrl}`] : []),
    ...materialLinks.map((material) => `${material.title}: ${material.url}`),
  ];
  const hasLinks = linkItems.length > 0;

  const saveSharedLink = (profileWithPdf: SavedProfile) => {
    const enrichedProfile = {
      ...profileWithPdf,
      productName,
      materials: materialLinks,
    };
    const shareId = profileWithPdf.shareId || saveSharedProfile(enrichedProfile);
    const shareUrl = generateShareUrlForProfile(shareId, enrichedProfile);
    const sharedAt = new Date().toISOString();

    onUpdate?.(profile.id, { shareId, shareUrl, sharedAt });
    return { shareId, shareUrl, sharedAt };
  };

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    onUpdate?.(profile.id, { pdfStatus: 'EM_ANALISE', pdfError: null });

    try {
      const result = await generatePdfForProduct({
        produto: productKey,
        cliente: {
          nome: profile.name,
          dataNascimento: profile.birthDate,
          telefone: profile.phone || '',
          email: profile.email,
        },
        dadosNumerologicos: {
          results: profile.results,
          personalYear: profile.data?.personalYear,
          compatibility: profile.data?.compatibility,
        },
        origem: 'plataforma',
      });

      if (!result.success || !result.pdfDataUrl) {
        const errorMessage = result.error || 'Não foi possível gerar o PDF.';
        onUpdate?.(profile.id, { pdfStatus: 'ERRO', pdfError: errorMessage });
        toast({ title: 'Não foi possível gerar o PDF', description: errorMessage, variant: 'destructive' });
        return;
      }

      const fileName = result.fileName || `${profile.profileName}.pdf`;
      const upload = await pdfStorageService.uploadProfilePdf({
        dataUrl: result.pdfDataUrl,
        fileName,
        clientName: profile.name,
      });

      const updates: Partial<SavedProfile> = {
        pdfStatus: upload.publicUrl ? 'PDF_GERADO' : 'ERRO',
        pdfDataUrl: result.pdfDataUrl,
        pdfFileName: fileName,
        pdfGeneratedAt: result.generatedAt || new Date().toISOString(),
        pdfError: upload.publicUrl ? null : upload.error || 'PDF gerado localmente, mas sem link público.',
        pdfPublicUrl: upload.publicUrl || null,
        pdfStoragePath: upload.path || null,
      };

      if (upload.publicUrl) {
        const nextProfile = { ...profile, ...updates } as SavedProfile;
        const share = saveSharedLink(nextProfile);
        updates.shareId = share.shareId;
        updates.shareUrl = share.shareUrl;
        updates.sharedAt = share.sharedAt;
      }

      onUpdate?.(profile.id, updates);
      toast({
        title: upload.publicUrl ? 'PDF gerado e publicado' : 'PDF gerado localmente',
        description: upload.publicUrl
          ? `${productName} de ${profile.name} ficou pronto para compartilhar.`
          : 'O PDF foi gerado, mas o envio por WhatsApp fica bloqueado até existir link público.',
        variant: upload.publicUrl ? undefined : 'destructive',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (profile.pdfPublicUrl) {
      window.open(profile.pdfPublicUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (profile.pdfDataUrl) {
      downloadPdfDataUrl(profile.pdfDataUrl, profile.pdfFileName || `${profile.profileName}.pdf`);
    }
  };

  const handleShareProfile = () => {
    if (!profile.pdfPublicUrl) {
      toast({
        title: 'PDF público necessário',
        description: 'Gere o PDF com upload público antes de compartilhar.',
        variant: 'destructive',
      });
      return;
    }

    const share = profile.shareUrl ? null : saveSharedLink(profile);
    onShare?.(share ? { ...profile, shareId: share.shareId, shareUrl: share.shareUrl, sharedAt: share.sharedAt } : profile);
  };

  const handleCopyLinks = async () => {
    if (!hasLinks) return;
    await navigator.clipboard.writeText(linkItems.join('\n'));
    toast({ title: 'Links copiados', description: 'Página compartilhada, PDF e materiais foram copiados.' });
  };

  const handleSendWhatsApp = () => {
    if (!canSendWhatsApp) {
      toast({
        title: 'WhatsApp indisponível',
        description: 'Para enviar, informe telefone e gere um PDF público com link compartilhado.',
        variant: 'destructive',
      });
      return;
    }

    const message = [
      `Olá, ${profile.name}. Seu ${productName} está pronto.`,
      '',
      'Preparei uma página com tudo organizado para você acessar com calma:',
      '',
      profile.shareUrl,
      '',
      'Por lá você encontra seu PDF, vídeo explicativo e materiais complementares.',
      '',
      'Com carinho,',
      'Carol Graber',
    ].join('\n');

    const url = `https://wa.me/${normalizeBrazilianPhone(profile.phone || '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onUpdate?.(profile.id, { pdfStatus: 'ENVIADO', pdfSentAt: new Date().toISOString() });
  };

  const handleStatusChange = (nextStatus: ProfilePdfStatus) => {
    onUpdate?.(profile.id, { pdfStatus: nextStatus });
  };

  return (
    <Card className="overflow-hidden border border-yellow-500/20 bg-slate-900/75 text-white shadow-lg shadow-black/10">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl leading-tight text-white">{profile.name}</CardTitle>
              <Badge className={statusClassName[status]}>{statusLabels[status]}</Badge>
              <Badge className={premiumClasses.badge}>{typeLabels[profile.type]}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(profile.id)}
                className="h-8 w-8 text-slate-200 hover:bg-white/10 hover:text-white"
                title={profile.favorite ? 'Remover dos favoritos' : 'Favoritar'}
              >
                <Star className={`h-5 w-5 ${profile.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
            </div>
            <p className="text-sm font-medium text-slate-300">{profile.profileName}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Button variant="outline" className={premiumClasses.secondaryButton} onClick={() => onLoad(profile)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver dados
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-300"
              onClick={handleSendWhatsApp}
              disabled={!canSendWhatsApp}
              title={!canSendWhatsApp ? 'Para enviar WhatsApp, informe telefone e gere PDF público com link compartilhado.' : undefined}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Enviar WhatsApp
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-200">
          {profile.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-yellow-400" />
              {formatBrazilianPhone(profile.phone)}
            </span>
          )}
          {profile.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-yellow-400" />
              {profile.email}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-yellow-400" />
            {formatDateBR(profile.birthDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-yellow-400" />
            Salvo em {formatDateTime(profile.timestamp)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md bg-white/[0.04] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Produto</p>
            <p className="mt-1 text-sm font-medium text-slate-50">{productName}</p>
          </div>
          <div className="rounded-md bg-white/[0.04] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-1 text-sm font-medium text-slate-50">{statusLabels[status]}</p>
          </div>
          <div className="rounded-md bg-white/[0.04] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Criada em</p>
            <p className="mt-1 text-sm font-medium text-slate-50">{formatDateTime(profile.timestamp)}</p>
          </div>
          <div className="rounded-md bg-white/[0.04] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Arquivo/PDF</p>
            <p className="mt-1 truncate text-sm font-medium text-slate-50">{getPublicPdfLabel(profile)}</p>
          </div>
        </div>

        {hasMaterials && (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Materiais complementares</p>
            <div className="mt-2 space-y-2">
              {materialLinks.map((material) => (
                <a
                  key={material.id}
                  href={material.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 rounded-md bg-white/[0.04] p-2 text-sm text-slate-100 hover:bg-white/[0.08]"
                >
                  <LinkIcon className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                  <span>
                    <span className="block font-medium">{material.title}</span>
                    {material.description && <span className="block text-xs text-slate-300">{material.description}</span>}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {profile.tags && profile.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-white/20 text-xs text-slate-200">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {profile.notes && (
          <p className="rounded-md bg-white/[0.03] p-3 text-sm text-slate-300">{profile.notes}</p>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <div className="w-full max-w-sm">
            <label htmlFor={`profile-status-${profile.id}`} className="text-xs font-medium text-slate-300">
              Atualizar status
            </label>
            <select
              id={`profile-status-${profile.id}`}
              value={status}
              onChange={(event) => handleStatusChange(event.target.value as ProfilePdfStatus)}
              className={`mt-1 ${premiumClasses.select}`}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>{statusLabels[option]}</option>
              ))}
            </select>
          </div>

          <Button className={`${premiumClasses.primaryButton} w-full`} onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
            <FileText className="mr-2 h-4 w-4" />
            {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}
          </Button>

          <div className="flex flex-wrap gap-2">
            {(profile.pdfPublicUrl || profile.pdfDataUrl) && (
              <Button variant="outline" className={premiumClasses.secondaryButton} onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            )}
            {onShare && (
              <Button variant="outline" className={premiumClasses.secondaryButton} onClick={handleShareProfile} disabled={!profile.pdfPublicUrl}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            )}
            <Button variant="outline" className={premiumClasses.secondaryButton} onClick={handleCopyLinks} disabled={!hasLinks}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar links
            </Button>
            <Button variant="outline" className={premiumClasses.secondaryButton} onClick={() => onEdit(profile)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => onDelete(profile.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {!canSendWhatsApp && (
          <p className="text-xs text-slate-300">
            Para enviar WhatsApp, informe telefone e gere PDF público com link compartilhado.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
