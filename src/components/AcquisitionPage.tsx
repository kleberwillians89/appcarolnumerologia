import React, { useMemo, useState } from 'react';
import { Copy, MessageCircle, TrendingUp, Users, ShoppingBag, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { premiumClasses } from '@/config/premiumClasses';
import { getProfiles, SavedProfile } from '@/utils/profileStorage';
import { formatBrazilianPhone, isValidBrazilianPhone, normalizeBrazilianPhone } from '@/utils/phoneUtils';

type OpportunityStatus =
  | 'Novo lead'
  | 'Interesse em produto'
  | 'Aguardando resposta'
  | 'Produto enviado'
  | 'Oportunidade de upsell'
  | 'Cliente ativo';

const catalogUrl = import.meta.env.VITE_CAROL_CATALOG_URL || '[link do catálogo]';

const statusOptions: OpportunityStatus[] = [
  'Novo lead',
  'Interesse em produto',
  'Aguardando resposta',
  'Produto enviado',
  'Oportunidade de upsell',
  'Cliente ativo',
];

const getProductLabel = (profile: SavedProfile) => {
  if (profile.type === 'personalYear') return 'Ano Pessoal';
  if (profile.type === 'compatibility') return 'Compatibilidade';
  return 'Mapa da Alma';
};

const templates = [
  {
    id: 'catalogo',
    title: 'Catálogo',
    build: (name = '[nome]') => [
      `Olá, ${name}. Separei aqui os produtos da Carol para você conhecer com calma:`,
      catalogUrl,
    ].join('\n'),
  },
  {
    id: 'continuidade',
    title: 'Continuidade após produto de entrada',
    build: (name = '[nome]') => [
      `Oi, ${name}. Agora que você já recebeu seu material, talvez faça sentido aprofundar sua leitura com a Carol.`,
      'Posso te mostrar as opções de atendimento?',
    ].join('\n'),
  },
  {
    id: 'novo-produto',
    title: 'Novo produto',
    build: (name = '[nome]') => [
      `Oi, ${name}. A Carol está com uma nova possibilidade de análise numerológica que pode fazer sentido para o seu momento.`,
      'Quer que eu te envie as informações?',
    ].join('\n'),
  },
];

const getInitialStatus = (profile: SavedProfile): OpportunityStatus => {
  if (profile.pdfSentAt || profile.pdfStatus === 'ENVIADO') return 'Produto enviado';
  if (profile.pdfDataUrl || profile.pdfStatus === 'PDF_GERADO') return 'Oportunidade de upsell';
  if (profile.phone) return 'Interesse em produto';
  return 'Novo lead';
};

export const AcquisitionPage: React.FC = () => {
  const [profiles] = useState(() => getProfiles());
  const [statuses, setStatuses] = useState<Record<string, OpportunityStatus>>(() =>
    getProfiles().reduce((acc, profile) => {
      acc[profile.id] = getInitialStatus(profile);
      return acc;
    }, {} as Record<string, OpportunityStatus>)
  );
  const { toast } = useToast();

  const totals = useMemo(() => {
    const activeClients = profiles.filter((profile) => profile.pdfSentAt || profile.pdfStatus === 'ENVIADO').length;
    const upsell = Object.values(statuses).filter((status) => status === 'Oportunidade de upsell').length;
    return {
      leads: profiles.length,
      activeClients,
      entryProducts: profiles.filter((profile) => profile.type === 'numerology' || profile.type === 'personalYear').length,
      upsell,
    };
  }, [profiles, statuses]);

  const copyText = async (text: string, title = 'Mensagem copiada') => {
    await navigator.clipboard.writeText(text);
    toast({ title, description: 'Texto pronto para colar no atendimento.' });
  };

  const openWhatsApp = (profile: SavedProfile, text: string) => {
    if (!profile.phone || !isValidBrazilianPhone(profile.phone)) {
      toast({
        title: 'WhatsApp não informado',
        description: 'Edite o perfil para cadastrar um telefone válido.',
        variant: 'destructive',
      });
      return;
    }

    const url = `https://wa.me/${normalizeBrazilianPhone(profile.phone)}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-yellow-500 text-sm font-semibold tracking-[0.2em]">CRM</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Aquisição de Clientes</h2>
        <p className="text-slate-300 mt-2 max-w-2xl">
          Organize contatos, oportunidades e mensagens para novos produtos da Carol.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Leads', value: totals.leads, icon: Users },
          { label: 'Clientes ativos', value: totals.activeClients, icon: Sparkles },
          { label: 'Produtos de entrada', value: totals.entryProducts, icon: ShoppingBag },
          { label: 'Oportunidades de upsell', value: totals.upsell, icon: TrendingUp },
        ].map((item) => (
          <Card key={item.label} className="border border-yellow-500/20 bg-slate-900/75 text-white">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-sm text-slate-300">{item.label}</p>
              </div>
              <item.icon className="h-6 w-6 text-yellow-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-yellow-500/20 bg-slate-900/75 text-white">
        <CardHeader>
          <CardTitle>Funil simples</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Badge key={status} className={premiumClasses.badge}>{status}</Badge>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-yellow-500/20 bg-slate-900/75 text-white">
        <CardHeader>
          <CardTitle>Templates de mensagem</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <p className="font-semibold text-white">{template.title}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{template.build()}</p>
              <Button
                variant="outline"
                className={`${premiumClasses.secondaryButton} mt-3`}
                onClick={() => copyText(template.build(), template.title)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar mensagem
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {profiles.length === 0 ? (
          <Card className="border border-yellow-500/20 bg-slate-900/75 text-white">
            <CardContent className="py-8 text-slate-300">
              Nenhuma oportunidade encontrada. Os perfis salvos aparecerão aqui como base inicial do CRM.
            </CardContent>
          </Card>
        ) : profiles.map((profile) => {
          const status = statuses[profile.id] || getInitialStatus(profile);
          const message = templates[1].build(profile.name);
          return (
            <Card key={profile.id} className="border border-yellow-500/20 bg-slate-900/75 text-white">
              <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                    <Badge className={premiumClasses.badge}>{getProductLabel(profile)}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
                    <span>{profile.phone ? formatBrazilianPhone(profile.phone) : 'WhatsApp pendente'}</span>
                    {profile.email && <span>{profile.email}</span>}
                    <span>Último produto: {getProductLabel(profile)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={status}
                    onChange={(event) => setStatuses((current) => ({ ...current, [profile.id]: event.target.value as OpportunityStatus }))}
                    className={premiumClasses.select}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <Button variant="outline" className={premiumClasses.secondaryButton} onClick={() => copyText(message, 'Mensagem da oportunidade copiada')}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => openWhatsApp(profile, message)}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
