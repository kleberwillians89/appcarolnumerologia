import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Download, FileText, Loader2, LogOut, PlayCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Delivery, DeliveryStatus, deliveryService, getProductLabel } from '@/services/deliveryService';
import { pdfStorageService } from '@/services/pdfStorageService';
import { sendLeadToGoogleSheets } from '@/services/googleSheetsService';
import { getProductMaterials } from '@/config/productMaterials';
import { formatBrazilianPhone, isValidBrazilianPhone, normalizeBrazilianPhone } from '@/utils/phoneUtils';
import { premiumClasses } from '@/config/premiumClasses';
import { productVideoUrl } from '@/config/env';

const statusLabel: Record<DeliveryStatus, string> = {
  PEDIDO_CRIADO: 'Pedido criado',
  AGUARDANDO_PAGAMENTO: 'Aguardando confirmação de pagamento',
  PAGAMENTO_CONFIRMADO: 'Pagamento confirmado',
  DADOS_RECEBIDOS: 'Dados recebidos',
  AGUARDANDO_DADOS: 'Aguardando dados',
  PDF_DEMO_GERADO: 'PDF demo disponível',
  PDF_GERADO: 'PDF disponível',
  PDF_ENVIADO: 'Enviado pelo WhatsApp',
  FINALIZADO: 'Finalizado',
};

const statusClassName: Record<DeliveryStatus, string> = {
  PEDIDO_CRIADO: 'border-sky-400/35 bg-sky-400/15 text-sky-100',
  AGUARDANDO_PAGAMENTO: 'border-yellow-400/35 bg-yellow-400/15 text-yellow-100',
  PAGAMENTO_CONFIRMADO: 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100',
  DADOS_RECEBIDOS: 'border-sky-400/35 bg-sky-400/15 text-sky-100',
  AGUARDANDO_DADOS: 'border-yellow-400/35 bg-yellow-400/15 text-yellow-100',
  PDF_DEMO_GERADO: 'border-amber-300/35 bg-amber-300/15 text-amber-100',
  PDF_GERADO: 'border-violet-400/35 bg-violet-400/15 text-violet-100',
  PDF_ENVIADO: 'border-violet-400/35 bg-violet-400/15 text-violet-100',
  FINALIZADO: 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100',
};

const blankForm = {
  nome: '',
  telefone: '',
  email: '',
  dataNascimento: '',
  observacoesCliente: '',
};

const needsForm = (delivery: Delivery) =>
  delivery.status === 'PAGAMENTO_CONFIRMADO' ||
  delivery.status === 'AGUARDANDO_DADOS' ||
  !delivery.nome ||
  !delivery.telefone ||
  !delivery.dataNascimento;

const progressSteps = [
  { label: 'Pedido', statuses: ['PEDIDO_CRIADO', 'AGUARDANDO_PAGAMENTO'] },
  { label: 'Pagamento', statuses: ['PAGAMENTO_CONFIRMADO', 'AGUARDANDO_DADOS'] },
  { label: 'Seus dados', statuses: ['DADOS_RECEBIDOS'] },
  { label: 'PDF', statuses: ['PDF_DEMO_GERADO', 'PDF_GERADO'] },
  { label: 'Entrega', statuses: ['PDF_ENVIADO', 'FINALIZADO'] },
] as const;

const getProgressIndex = (status: DeliveryStatus) => {
  const index = progressSteps.findIndex((step) => (step.statuses as readonly string[]).includes(status));
  return index < 0 ? 0 : index;
};

export const CustomerPortal: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const activeDelivery = deliveries[0] || null;

  const loadDeliveries = useCallback(async () => {
    if (!user?.id) {
      setDeliveries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await deliveryService.fetchDeliveriesForCurrentUser(user.id);
      setDeliveries(data);

      const urlEntries = await Promise.all(
        data.map(async (delivery) => {
          const url = await pdfStorageService.getPdfUrlForDelivery(delivery);
          return url ? [delivery.id, url] as const : null;
        })
      );

      setPdfUrls(Object.fromEntries(urlEntries.filter(Boolean) as Array<readonly [string, string]>));
    } catch (error) {
      toast({
        title: 'Não foi possível carregar sua área',
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user?.id]);

  useEffect(() => {
    void loadDeliveries();

    const handleUpdate = () => void loadDeliveries();
    window.addEventListener('deliveriesUpdated', handleUpdate);
    return () => window.removeEventListener('deliveriesUpdated', handleUpdate);
  }, [loadDeliveries]);

  useEffect(() => {
    if (!activeDelivery) return;

    setForm({
      nome: activeDelivery.nome || profile?.full_name || profile?.name || '',
      telefone: activeDelivery.telefone ? formatBrazilianPhone(activeDelivery.telefone) : '',
      email: activeDelivery.email || profile?.email || user?.email || '',
      dataNascimento: activeDelivery.dataNascimento || '',
      observacoesCliente: activeDelivery.observacoesCliente || '',
    });
  }, [activeDelivery, profile, user?.email]);

  const materials = useMemo(() => {
    if (!activeDelivery) return [];
    return getProductMaterials(activeDelivery).filter((material) => material.type === 'video' && material.url);
  }, [activeDelivery]);
  const videoUrl = materials.find((material) => material.type === 'video' && material.url)?.url || productVideoUrl;

  useEffect(() => setVideoFailed(false), [videoUrl]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeDelivery) return;

    if (!form.nome.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Informe seu nome completo.', variant: 'destructive' });
      return;
    }

    if (!form.dataNascimento) {
      toast({ title: 'Data obrigatória', description: 'Informe sua data de nascimento.', variant: 'destructive' });
      return;
    }

    if (!form.telefone.trim() || !isValidBrazilianPhone(form.telefone)) {
      toast({
        title: 'WhatsApp obrigatório',
        description: 'Informe um telefone válido para receber sua entrega.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const telefoneNormalizado = normalizeBrazilianPhone(form.telefone);
      const dadosCliente = {
        ...(activeDelivery.dadosCliente || {}),
        nome: form.nome.trim(),
        telefone: form.telefone,
        telefoneNormalizado,
        email: form.email.trim() || user?.email || '',
        dataNascimento: form.dataNascimento,
        produto: activeDelivery.produto,
        etapa: 'dados_enviados',
      };
      const updatedDelivery = await deliveryService.submitCustomerData(activeDelivery.id, {
        nome: form.nome.trim(),
        telefone: form.telefone,
        telefoneNormalizado,
        email: form.email.trim() || user?.email || '',
        dataNascimento: form.dataNascimento,
        observacoesCliente: form.observacoesCliente,
        dadosCliente,
      });

      void sendLeadToGoogleSheets({
        nome: updatedDelivery.nome,
        telefone: updatedDelivery.telefone,
        telefoneNormalizado: updatedDelivery.telefoneNormalizado,
        email: updatedDelivery.email,
        produto: updatedDelivery.produto,
        dataNascimento: updatedDelivery.dataNascimento,
        status: updatedDelivery.status,
        origem: updatedDelivery.origem,
        observacoesCliente: updatedDelivery.observacoesCliente,
        createdAt: updatedDelivery.dataCriacao,
      });

      setDeliveries((current) => current.map((delivery) => (
        delivery.id === updatedDelivery.id ? updatedDelivery : delivery
      )));

      toast({
        title: 'Dados enviados',
        description: 'A Carol já pode preparar sua entrega.',
      });
    } catch (error) {
      toast({
        title: 'Não foi possível salvar',
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050B1A] px-4 text-[#F8F5EF]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#C9A96E]" />
        Carregando sua área...
      </div>
    );
  }

  if (!activeDelivery) {
    return <Navigate to="/loja" replace />;
  }

  const inlinePdfUrl = activeDelivery.pdfDataUrl?.startsWith('data:application/pdf') && activeDelivery.pdfDataUrl.length > 1000
    ? activeDelivery.pdfDataUrl
    : '';
  const remotePdfUrl = activeDelivery.linkPdf?.startsWith('http') ? activeDelivery.linkPdf : '';
  const pdfUrl = pdfUrls[activeDelivery.id] || inlinePdfUrl || remotePdfUrl;
  const showWaiting = activeDelivery.status === 'PEDIDO_CRIADO' || activeDelivery.status === 'AGUARDANDO_PAGAMENTO';
  const showForm = !showWaiting && needsForm(activeDelivery);
  const showPortal = !showWaiting && !showForm;
  const progressIndex = getProgressIndex(activeDelivery.status);

  return (
    <div className={premiumClasses.page}>
      <header className={premiumClasses.header}>
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-3 px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.28em] text-[#C9A96E]">CAROL GRABER</p>
            <h1 className="truncate text-xl font-bold text-white sm:text-2xl">Minha Área</h1>
          </div>
          <Button
            variant="outline"
            className="h-11 shrink-0 border-[#F8F5EF]/25 bg-transparent px-3 text-[#F8F5EF] hover:bg-[#F8F5EF]/10 hover:text-white"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-screen-md flex-col gap-5 px-4 py-6 sm:py-8">
        <section className="rounded-lg border border-[#C9A96E]/25 bg-[#0B1426]/95 p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-[#C9A96E]">SEU PRODUTO</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{getProductLabel(activeDelivery.produto)}</h2>
            </div>
            <Badge className={`${statusClassName[activeDelivery.status]} w-fit rounded-full border px-3 py-1`}>
              {statusLabel[activeDelivery.status]}
            </Badge>
          </div>
          <Button asChild variant="outline" className="mt-5 h-11 w-full border-[#C9A96E]/35 bg-transparent text-[#F8F5EF] hover:bg-[#C9A96E]/10 hover:text-white sm:w-auto">
            <Link to="/loja">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ver outros produtos
            </Link>
          </Button>
        </section>

        <section className="rounded-2xl border border-[#C9A96E]/20 bg-[#0B1426]/75 p-4 sm:p-5" aria-label="Progresso do pedido">
          <div className="grid grid-cols-5 gap-1 sm:gap-3">
            {progressSteps.map((step, index) => {
              const complete = index <= progressIndex;
              return (
                <div key={step.label} className="min-w-0 text-center">
                  <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border ${complete ? 'border-[#C9A96E] bg-[#C9A96E] text-[#06101d]' : 'border-white/15 bg-[#07101d] text-white/35'}`}>
                    {index < progressIndex ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                  </div>
                  <p className={`mt-2 truncate text-[10px] font-semibold sm:text-xs ${complete ? 'text-[#F8F5EF]' : 'text-[#F8F5EF]/35'}`}>{step.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {showWaiting && (
          <section className="rounded-lg border border-yellow-400/25 bg-yellow-400/10 p-5 text-center">
            <Calendar className="mx-auto h-8 w-8 text-yellow-200" />
            <h3 className="mt-4 text-xl font-bold text-white">Aguardando confirmação de pagamento</h3>
            <p className="mt-3 text-sm leading-6 text-[#F8F5EF]/75">
              Seu pedido foi registrado. Assim que a Carol confirmar o pagamento, o formulário será liberado aqui.
            </p>
            <Button
              variant="outline"
              className="mt-5 h-12 w-full border-[#F8F5EF]/25 bg-transparent text-[#F8F5EF] hover:bg-[#F8F5EF]/10 sm:w-auto"
              onClick={loadDeliveries}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </section>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-lg border border-[#C9A96E]/25 bg-[#0B1426]/95 p-5 shadow-xl shadow-black/20">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-white">Preencha seus dados</h3>
              <p className="mt-2 text-sm leading-6 text-[#F8F5EF]/70">
                Essas informações serão usadas para preparar sua entrega personalizada.
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="customer-name" className={premiumClasses.label}>Nome completo</Label>
                <Input
                  id="customer-name"
                  value={form.nome}
                  onChange={(event) => setForm({ ...form, nome: event.target.value })}
                  className={`${premiumClasses.input} mt-2 h-12`}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer-phone" className={premiumClasses.label}>WhatsApp</Label>
                <Input
                  id="customer-phone"
                  value={form.telefone}
                  onChange={(event) => setForm({ ...form, telefone: formatBrazilianPhone(event.target.value) })}
                  placeholder="(11) 99999-9999"
                  className={`${premiumClasses.input} mt-2 h-12`}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer-email" className={premiumClasses.label}>E-mail</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className={`${premiumClasses.input} mt-2 h-12`}
                />
              </div>

              <div>
                <Label htmlFor="customer-birth" className={premiumClasses.label}>Data de nascimento</Label>
                <Input
                  id="customer-birth"
                  type="date"
                  value={form.dataNascimento}
                  onChange={(event) => setForm({ ...form, dataNascimento: event.target.value })}
                  className={`${premiumClasses.input} mt-2 h-12`}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer-notes" className={premiumClasses.label}>Observações</Label>
                <Textarea
                  id="customer-notes"
                  value={form.observacoesCliente}
                  onChange={(event) => setForm({ ...form, observacoesCliente: event.target.value })}
                  className={`${premiumClasses.textarea} mt-2 min-h-28`}
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className={`${premiumClasses.primaryButton} mt-6 h-12 w-full text-base`}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              {saving ? 'Enviando...' : 'Enviar dados'}
            </Button>
          </form>
        )}

        {showPortal && (
          <section className="grid gap-4">
            <article className="rounded-lg border border-[#C9A96E]/25 bg-[#0B1426]/95 p-5 shadow-xl shadow-black/20">
              <FileText className="h-8 w-8 text-[#C9A96E]" />
              <h3 className="mt-4 text-xl font-bold text-white">Seu PDF</h3>
              <p className="mt-2 text-sm leading-6 text-[#F8F5EF]/70">
                Quando o material estiver pronto, ele aparecerá aqui para download.
              </p>
              {activeDelivery.status === 'PDF_DEMO_GERADO' && (
                <div className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                  PDF demonstrativo gerado em ambiente de teste.
                </div>
              )}
              {pdfUrl ? (
                <Button asChild className={`${premiumClasses.primaryButton} mt-5 h-12 w-full text-base`}>
                  <a href={pdfUrl} download={activeDelivery.fileName || undefined} target={pdfUrl.startsWith('data:') ? undefined : '_blank'} rel="noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </a>
                </Button>
              ) : (
                <div className="mt-5 rounded-md border border-[#F8F5EF]/10 bg-[#070D1D] p-4 text-sm text-[#F8F5EF]/70">
                  PDF em preparação.
                </div>
              )}
            </article>

            <article className="rounded-lg border border-[#C9A96E]/25 bg-[#0B1426]/95 p-5 shadow-xl shadow-black/20">
              <PlayCircle className="h-8 w-8 text-[#C9A96E]" />
              <h3 className="mt-4 text-xl font-bold text-white">Vídeo do produto</h3>
              {videoUrl && !videoFailed ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#C9A96E]/20 bg-black">
                  <video
                    className="aspect-video w-full"
                    controls
                    playsInline
                    preload="metadata"
                    src={videoUrl}
                    onError={() => setVideoFailed(true)}
                  >
                    Seu navegador não oferece suporte ao player de vídeo.
                  </video>
                </div>
              ) : (
                <div className="mt-5 rounded-md border border-[#F8F5EF]/10 bg-[#070D1D] p-4 text-sm text-[#F8F5EF]/70">
                  O vídeo complementar será disponibilizado junto com a entrega.
                </div>
              )}
            </article>
          </section>
        )}
      </main>
    </div>
  );
};
