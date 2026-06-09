import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Copy,
  Download,
  Edit,
  FileText,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  Phone,
  Share2,
  Star,
  Trash2,
} from 'lucide-react';

import { SavedProfile, ProfilePdfStatus } from '@/utils/profileStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { formatDateBR } from '@/utils/dateUtils';
import { generatePdfForProduct, PdfProductKey } from '@/services/pdfDeliveryService';
import { getProductConfiguredName, getProductMaterials } from '@/config/productMaterials';
import { formatBrazilianPhone, isValidBrazilianPhone, normalizeBrazilianPhone } from '@/utils/phoneUtils';
import { useToast } from '@/hooks/use-toast';
import { premiumClasses } from '@/config/premiumClasses';

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
  EM_ANALISE: 'Em análise',
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
  if (profile.pdfDataUrl) return 'PDF_GERADO';
  return 'PENDENTE';
};

const getProductKey = (profile: SavedProfile): PdfProductKey => {
  if (profile.type === 'personalYear') return 'ano_pessoal';
  return 'mapa';
};

const getProductContext = (profile: SavedProfile) => ({
  productKey: getProductKey(profile),
  productName: getProductConfiguredName(getProductKey(profile)),
});

const downloadPdfDataUrl = (dataUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};

const formatDateTime = (timestamp?: number | string | null) => {
  if (!timestamp) return 'Não informado';
  return format(new Date(timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR });
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
  const { productKey, productName } = getProductContext(profile);
  const materials = useMemo(() => getProductMaterials(productKey), [productKey]);
  const hasPdf = Boolean(profile.pdfDataUrl);
  const linkItems = [
    ...(profile.pdfDataUrl ? [`PDF: ${profile.pdfDataUrl}`] : []),
    ...materials.filter((material) => material.url).map((material) => `${material.title}: ${material.url}`),
  ];
  const hasLinks = linkItems.length > 0;
  const hasPhone = Boolean(profile.phone && isValidBrazilianPhone(profile.phone));
  const canSendWhatsApp = hasPhone && (hasPdf || hasLinks);
  const pdfLabel = profile.pdfFileName || (hasPdf ? 'PDF gerado' : 'Ainda não gerado');

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
        toast({
          title: 'Não foi possível gerar o PDF',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      onUpdate?.(profile.id, {
        pdfStatus: 'PDF_GERADO',
        pdfDataUrl: result.pdfDataUrl,
        pdfFileName: result.fileName || `${profile.profileName}.pdf`,
        pdfGeneratedAt: result.generatedAt || new Date().toISOString(),
        pdfError: null,
      });

      toast({
        title: 'PDF gerado',
        description: `${productName} de ${profile.name} ficou pronto no card de Perfis.`,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!profile.pdfDataUrl) return;
    downloadPdfDataUrl(profile.pdfDataUrl, profile.pdfFileName || `${profile.profileName}.pdf`);
  };

  const handleCopyLinks = async () => {
    if (!hasLinks) return;
    await navigator.clipboard.writeText(linkItems.join('\n'));
    toast({
      title: 'Links copiados',
      description: 'PDF e materiais complementares foram copiados.',
    });
  };

  const handleSendWhatsApp = () => {
    if (!canSendWhatsApp) return;

    const message = [
      `Olá, ${profile.name}. Seu ${productName} está pronto.`,
      '',
      hasPdf ? `Arquivo PDF: ${profile.pdfFileName || 'PDF gerado no app'}` : '',
      ...materials.filter((material) => material.url).map((material) => `${material.title}: ${material.url}`),
      '',
      'Com carinho,',
      'Carol Graber',
    ].filter(Boolean).join('\n');

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
            </div>
            <p className="text-sm font-medium text-slate-300">{profile.profileName}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(profile.id)}
            className="self-start text-slate-200 hover:bg-white/10 hover:text-white"
            title={profile.favorite ? 'Remover dos favoritos' : 'Favoritar'}
          >
            <Star className={`h-5 w-5 ${profile.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
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
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Arquivo/PDF</p>
            <p className="mt-1 truncate text-sm font-medium text-slate-50">{pdfLabel}</p>
          </div>
          <div className="rounded-md bg-white/[0.04] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Materiais</p>
            <p className="mt-1 text-sm font-medium text-slate-50">
              {materials.length > 0 ? `${materials.length} disponível(is)` : 'Nenhum configurado'}
            </p>
          </div>
        </div>

        {materials.length > 0 && (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Materiais complementares</p>
            <div className="mt-2 space-y-2">
              {materials.map((material) => (
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
            {profile.tags.map(tag => (
              <Badge key={tag} variant="outline" className="border-white/20 text-xs text-slate-200">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {profile.notes && (
          <p className="rounded-md bg-white/[0.03] p-3 text-sm text-slate-300">{profile.notes}</p>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-sm">
            <label htmlFor={`profile-status-${profile.id}`} className="text-xs font-medium text-slate-300">Atualizar status</label>
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

          <div className="flex flex-wrap gap-2">
            <Button className={premiumClasses.primaryButton} onClick={() => onLoad(profile)}>
              Carregar
            </Button>
            <Button className={premiumClasses.primaryButton} onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
              <FileText className="mr-2 h-4 w-4" />
              {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}
            </Button>
            {hasPdf && (
              <Button variant="outline" className={premiumClasses.secondaryButton} onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            )}
            {onShare && (
              <Button variant="outline" className={premiumClasses.secondaryButton} onClick={() => onShare(profile)}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            )}
            <Button variant="outline" className={premiumClasses.secondaryButton} onClick={handleCopyLinks} disabled={!hasLinks}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar links
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-300"
              onClick={handleSendWhatsApp}
              disabled={!canSendWhatsApp}
              title={!canSendWhatsApp ? 'Para enviar WhatsApp, informe telefone e gere PDF ou configure material complementar.' : undefined}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Enviar WhatsApp
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
          <p className="text-xs text-slate-300">Para enviar WhatsApp, informe telefone e gere PDF ou configure material complementar.</p>
        )}
      </CardContent>
    </Card>
  );
};
