import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleCheckBig, Clock3, Download, Eye, FileText, Loader2, MessageCircle, RefreshCw, Search, Send, Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Delivery, DeliveryStatus, deliveryService, getProductLabel, isValidUuid } from '@/services/deliveryService';
import { generateDemoPdf, generatePdfForProduct } from '@/services/pdfDeliveryService';
import { pdfStorageService } from '@/services/pdfStorageService';
import { buildDefaultWhatsAppMessage, whatsappService } from '@/services/whatsappService';
import { formatBrazilianPhone, isValidBrazilianPhone } from '@/utils/phoneUtils';
import { premiumClasses } from '@/config/premiumClasses';
import { getPdfTemplateKey } from '@/config/catalogProducts';
import { Input } from '@/components/ui/input';
import { demoMode } from '@/config/env';

const deliveryStatusLabel: Record<DeliveryStatus, string> = {
  PEDIDO_CRIADO: 'Pedido criado',
  AGUARDANDO_PAGAMENTO: 'Pedido criado',
  PAGAMENTO_CONFIRMADO: 'Aguardando dados',
  DADOS_RECEBIDOS: 'Dados recebidos',
  AGUARDANDO_DADOS: 'Aguardando dados',
  PDF_DEMO_GERADO: 'PDF demo gerado',
  PDF_GERADO: 'PDF gerado',
  PDF_ENVIADO: 'Enviado pelo WhatsApp',
  FINALIZADO: 'Finalizado',
};

const deliveryStatusClassName: Record<DeliveryStatus, string> = {
  PEDIDO_CRIADO: 'border-yellow-400/35 bg-yellow-400/15 text-yellow-100',
  AGUARDANDO_PAGAMENTO: 'border-yellow-400/35 bg-yellow-400/15 text-yellow-100',
  PAGAMENTO_CONFIRMADO: 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100',
  DADOS_RECEBIDOS: 'border-sky-400/35 bg-sky-400/15 text-sky-100',
  AGUARDANDO_DADOS: 'border-yellow-400/35 bg-yellow-400/15 text-yellow-100',
  PDF_DEMO_GERADO: 'border-amber-300/35 bg-amber-300/15 text-amber-100',
  PDF_GERADO: 'border-blue-400/35 bg-blue-400/15 text-blue-100',
  PDF_ENVIADO: 'border-violet-400/35 bg-violet-400/15 text-violet-100',
  FINALIZADO: 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100',
};

const getPaymentLabel = (delivery: Delivery) =>
  delivery.status === 'PEDIDO_CRIADO' || delivery.status === 'AGUARDANDO_PAGAMENTO' ? 'Aguardando pagamento' : 'Confirmado';

const getPaymentClassName = (delivery: Delivery) =>
  delivery.status === 'PEDIDO_CRIADO' || delivery.status === 'AGUARDANDO_PAGAMENTO'
    ? 'border-yellow-400/35 bg-yellow-400/15 text-yellow-100'
    : 'border-emerald-400/35 bg-emerald-400/15 text-emerald-100';

const getDeliveryPhone = (delivery: Delivery) => delivery.telefoneNormalizado || delivery.telefone || '';

const getFormattedPhone = (delivery: Delivery) => {
  const phone = getDeliveryPhone(delivery);
  return phone ? formatBrazilianPhone(phone) : 'WhatsApp pendente';
};

const hasPdf = (delivery: Delivery) => Boolean(delivery.linkPdf || delivery.pdfDataUrl || delivery.pdfStoragePath);
const getPdfDownloadUrl = (delivery: Delivery) => {
  if (delivery.pdfDataUrl?.startsWith('data:application/pdf') && delivery.pdfDataUrl.length > 1000) return delivery.pdfDataUrl;
  if (delivery.linkPdf?.startsWith('http')) return delivery.linkPdf;
  return '';
};
const getPdfKindLabel = (delivery: Delivery) => {
  if (!hasPdf(delivery)) return 'Pendente';
  if (delivery.status === 'PDF_DEMO_GERADO' || delivery.dadosCliente?.pdfKind === 'demo') return 'Demo local';
  return 'Real';
};

const canGeneratePdf = (delivery: Delivery) =>
  delivery.status === 'DADOS_RECEBIDOS' &&
  Boolean(delivery.nome && delivery.dataNascimento && isValidBrazilianPhone(getDeliveryPhone(delivery)));

const canSendWhatsApp = (delivery: Delivery) => hasPdf(delivery) && isValidBrazilianPhone(getDeliveryPhone(delivery));

const formatDate = (value?: string | null) => {
  if (!value) return 'Data pendente';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
};

const humanizeKey = (key: string) => key
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/_/g, ' ')
  .replace(/^./, (letter) => letter.toUpperCase());

export const DeliveriesPage: React.FC = () => {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [whatsAppDelivery, setWhatsAppDelivery] = useState<Delivery | null>(null);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [detailsDelivery, setDetailsDelivery] = useState<Delivery | null>(null);
  const [search, setSearch] = useState('');

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      setDeliveries(await deliveryService.fetchDeliveriesForAdmin());
    } catch (error) {
      toast({
        title: 'Erro ao carregar entregas',
        description: error instanceof Error ? error.message : 'Verifique a conexão e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadDeliveries();

    const handleUpdate = () => void loadDeliveries();
    window.addEventListener('deliveriesUpdated', handleUpdate);
    return () => window.removeEventListener('deliveriesUpdated', handleUpdate);
  }, [loadDeliveries]);

  const totals = useMemo(() => {
    return deliveries.reduce(
      (acc, delivery) => {
        acc.total += 1;
        if (delivery.status === 'PEDIDO_CRIADO' || delivery.status === 'AGUARDANDO_PAGAMENTO') acc.pending += 1;
        if (!['PEDIDO_CRIADO', 'AGUARDANDO_PAGAMENTO'].includes(delivery.status)) acc.paid += 1;
        if (delivery.status === 'PAGAMENTO_CONFIRMADO' || delivery.status === 'AGUARDANDO_DADOS') acc.awaitingData += 1;
        if (delivery.status === 'DADOS_RECEBIDOS') acc.ready += 1;
        if (hasPdf(delivery) && delivery.status !== 'PDF_DEMO_GERADO' && delivery.dadosCliente?.pdfKind !== 'demo') acc.pdfs += 1;
        return acc;
      },
      { total: 0, pending: 0, paid: 0, awaitingData: 0, ready: 0, pdfs: 0 }
    );
  }, [deliveries]);

  const filteredDeliveries = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    if (!term) return deliveries;
    return deliveries.filter((delivery) => [
      delivery.nome,
      delivery.email,
      delivery.telefone,
      getProductLabel(delivery.produto),
      deliveryStatusLabel[delivery.status],
    ].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term)));
  }, [deliveries, search]);

  const handleMarkAsPaid = async (delivery: Delivery) => {
    setUpdatingId(delivery.id);
    try {
      await deliveryService.updateDeliveryStatus(delivery.id, 'PAGAMENTO_CONFIRMADO');
      toast({
        title: 'Pagamento confirmado',
        description: `O formulário de ${delivery.nome} foi liberado.`,
      });
      await loadDeliveries();
    } catch (error) {
      toast({
        title: 'Não foi possível marcar como pago',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGeneratePdf = async (delivery: Delivery) => {
    if (!canGeneratePdf(delivery)) {
      toast({
        title: 'Dados incompletos',
        description: 'Para gerar PDF, o pedido precisa estar pago e ter nome, data de nascimento e WhatsApp válido.',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingId(delivery.id);
    try {
      const result = demoMode
        ? generateDemoPdf({
            clientName: delivery.nome,
            productTitle: getProductLabel(delivery.produto),
            birthDate: delivery.dataNascimento || '',
          })
        : await generatePdfForProduct({
            produto: getPdfTemplateKey(delivery.produto),
            cliente: {
              nome: delivery.nome,
              dataNascimento: delivery.dataNascimento || '',
              telefone: getFormattedPhone(delivery),
              email: delivery.email,
            },
            dadosNumerologicos: delivery.dadosNumerologicos || {},
            origem: 'entregas',
          });

      if (!result.success) {
        toast({
          title: 'Não foi possível gerar o PDF',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      let linkPdf = result.linkPdf || null;
      let pdfStoragePath: string | null = null;

      if (!demoMode && isValidUuid(delivery.id) && result.fileName && result.pdfDataUrl) {
        const upload = await pdfStorageService.uploadPdf({
          dataUrl: result.pdfDataUrl,
          fileName: result.fileName,
          deliveryId: delivery.id,
          userId: delivery.userId,
        });

        if (!upload.success || !upload.path) throw new Error(upload.error || 'O PDF foi gerado, mas não pôde ser salvo.');

        pdfStoragePath = upload.path;
        const signed = await pdfStorageService.createSignedPdfUrl(upload.path);
        if (!signed.success) throw new Error(signed.error || 'Não foi possível liberar o acesso ao PDF.');
        linkPdf = signed.signedUrl || linkPdf;
        const record = await pdfStorageService.createPdfFileRecord({
          deliveryId: delivery.id,
          userId: delivery.userId,
          fileName: result.fileName,
          path: upload.path,
          signedUrl: signed.signedUrl,
        });
        if (!record.success) throw new Error(record.error || 'Não foi possível registrar o PDF.');
      }

      await deliveryService.updateDeliveryPdf(delivery, {
        linkPdf,
        pdfDataUrl: result.pdfDataUrl,
        fileName: result.fileName,
        pdfStoragePath,
        demo: demoMode,
      });

      toast({
        title: demoMode ? 'PDF demonstrativo gerado' : 'PDF gerado',
        description: demoMode
          ? 'Arquivo local criado para a apresentação. Ele não será tratado como entrega final.'
          : `${getProductLabel(delivery.produto)} está pronto para envio.`,
      });
      await loadDeliveries();
    } catch (error) {
      toast({
        title: 'Não foi possível gerar o PDF',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const openWhatsAppModal = (delivery: Delivery) => {
    setWhatsAppDelivery(delivery);
    setWhatsAppMessage(buildDefaultWhatsAppMessage(delivery));
  };

  const handleSendWhatsApp = async () => {
    if (!whatsAppDelivery) return;

    setSendingId(whatsAppDelivery.id);
    try {
      const result = await whatsappService.sendPdfLink(whatsAppDelivery, whatsAppMessage);
      if (!result.success) {
        toast({
          title: 'WhatsApp não enviado',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      const isDemoPdf = whatsAppDelivery.status === 'PDF_DEMO_GERADO' || whatsAppDelivery.dadosCliente?.pdfKind === 'demo';
      if (!isDemoPdf) {
        await deliveryService.markDeliveryAsSent(whatsAppDelivery, result.sentAt || new Date().toISOString());
      }
      setWhatsAppDelivery(null);
      toast({
        title: 'WhatsApp aberto',
        description: isDemoPdf
          ? 'O PDF demonstrativo não foi marcado como entrega real.'
          : 'A entrega foi marcada como enviada.',
      });
      await loadDeliveries();
    } catch (error) {
      toast({
        title: 'Não foi possível enviar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleFinalize = async (delivery: Delivery) => {
    setUpdatingId(delivery.id);
    try {
      await deliveryService.updateDeliveryStatus(delivery.id, 'FINALIZADO');
      toast({ title: 'Atendimento finalizado', description: `${delivery.nome} foi movido para finalizado.` });
      await loadDeliveries();
    } catch (error) {
      toast({ title: 'Não foi possível finalizar', description: error instanceof Error ? error.message : 'Tente novamente.', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const renderActions = (delivery: Delivery) => (
    <div className="flex min-w-[210px] flex-wrap justify-stretch gap-2 xl:justify-end">
      <Button
        variant="outline"
        className="h-10 flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 xl:flex-none"
        onClick={() => setDetailsDelivery(delivery)}
      >
        <Eye className="mr-2 h-4 w-4" />
        Ver dados
      </Button>

      <Button
        className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-[#111827] disabled:text-[#F8F5EF]/40 xl:w-auto"
        onClick={() => handleMarkAsPaid(delivery)}
        disabled={!['PEDIDO_CRIADO', 'AGUARDANDO_PAGAMENTO'].includes(delivery.status) || updatingId === delivery.id}
      >
        {updatingId === delivery.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
        Confirmar pagamento
      </Button>

      <Button
        className={`${premiumClasses.primaryButton} h-10 w-full disabled:bg-[#111827] disabled:text-[#F8F5EF]/40 xl:w-auto`}
        onClick={() => handleGeneratePdf(delivery)}
        disabled={!canGeneratePdf(delivery) || generatingId === delivery.id}
      >
        {generatingId === delivery.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
        PDF
      </Button>

      <Button
        className="h-10 w-full bg-[#1F9D66] text-white hover:bg-[#26B979] disabled:bg-[#111827] disabled:text-[#F8F5EF]/40 xl:w-auto"
        onClick={() => openWhatsAppModal(delivery)}
        disabled={!canSendWhatsApp(delivery)}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>

      {getPdfDownloadUrl(delivery) && (
        <Button asChild variant="outline" className="h-10 flex-1 border-[#C9A96E]/35 bg-transparent text-[#F8F5EF] hover:bg-[#C9A96E]/10 xl:flex-none">
          <a
            href={getPdfDownloadUrl(delivery)}
            download={delivery.fileName || undefined}
            target={getPdfDownloadUrl(delivery).startsWith('data:') ? undefined : '_blank'}
            rel="noreferrer"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </a>
        </Button>
      )}

      {delivery.status === 'PDF_ENVIADO' && (
        <Button
          variant="outline"
          className="h-10 flex-1 border-[#F8F5EF]/20 bg-transparent text-[#F8F5EF] hover:bg-white/10 xl:flex-none"
          onClick={() => handleFinalize(delivery)}
          disabled={updatingId === delivery.id}
        >
          <CircleCheckBig className="mr-2 h-4 w-4" />
          Finalizar
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#C9A96E]/25 bg-[#0B1426]/95 p-4 shadow-xl shadow-black/20 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[#C9A96E]">OPERAÇÃO</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Entregas</h2>
            <p className="mt-2 text-sm text-[#F8F5EF]/65">
              Pagamento, formulário, PDF e WhatsApp em uma mesa de trabalho.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-11 w-full border-[#F8F5EF]/25 bg-transparent text-[#F8F5EF] hover:bg-[#F8F5EF]/10 sm:w-auto"
            onClick={loadDeliveries}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {[
          { label: 'Clientes e pedidos', value: totals.total, icon: Users },
          { label: 'Pagamento pendente', value: totals.pending, icon: Clock3 },
          { label: 'Pagamentos confirmados', value: totals.paid, icon: CheckCircle2 },
          { label: 'Aguardando preenchimento', value: totals.awaitingData, icon: FileText },
          { label: 'Prontos para gerar', value: totals.ready, icon: Sparkles },
          { label: 'PDFs reais gerados', value: totals.pdfs, icon: FileText },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-[#C9A96E]/20 bg-[#0B1426]/90 p-4 shadow-lg shadow-black/10">
            <div className="flex items-start justify-between gap-3"><p className="text-3xl font-bold text-white">{item.value}</p><item.icon className="h-5 w-5 text-[#C9A96E]" /></div>
            <p className="mt-1 text-sm text-[#F8F5EF]/65">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-[#C9A96E]/25 bg-[#0B1426]/95 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-3 border-b border-[#F8F5EF]/10 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-white">Fila de pedidos</h3>
            <p className="text-sm text-[#F8F5EF]/60">{filteredDeliveries.length} de {deliveries.length} registros</p>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F8F5EF]/40" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cliente, produto ou status"
              className="h-11 border-white/10 bg-[#07101d] pl-10 text-white placeholder:text-white/35"
            />
          </div>
        </div>

        <div className="hidden max-h-[calc(100vh-330px)] min-h-[280px] overflow-auto xl:block">
          <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#0B1426] text-xs uppercase tracking-wide text-[#F8F5EF]/45">
              <tr>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Produto</th>
                <th className="px-4 py-3 font-semibold">Status de Pagamento</th>
                <th className="px-4 py-3 font-semibold">Status de Entrega</th>
                <th className="px-4 py-3 font-semibold">PDF</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#F8F5EF]/65">
                    Carregando entregas...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#F8F5EF]/65">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="group">
                    <td className="border-t border-[#F8F5EF]/10 px-4 py-4 group-hover:bg-[#102033]">
                      <p className="font-semibold text-white">{delivery.nome || 'Cliente'}</p>
                      <p className="mt-1 text-xs text-[#F8F5EF]/55">{delivery.email || 'E-mail pendente'}</p>
                      <p className="mt-1 text-xs text-[#F8F5EF]/55">{getFormattedPhone(delivery)}</p>
                    </td>
                    <td className="border-t border-[#F8F5EF]/10 px-4 py-4 group-hover:bg-[#102033]">
                      <p className="font-medium text-white">{getProductLabel(delivery.produto)}</p>
                      <p className="mt-1 text-xs text-[#F8F5EF]/55">{formatDate(delivery.dataNascimento)}</p>
                    </td>
                    <td className="border-t border-[#F8F5EF]/10 px-4 py-4 group-hover:bg-[#102033]">
                      <Badge className={`${getPaymentClassName(delivery)} rounded-full border px-3 py-1`}>
                        {getPaymentLabel(delivery)}
                      </Badge>
                    </td>
                    <td className="border-t border-[#F8F5EF]/10 px-4 py-4 group-hover:bg-[#102033]">
                      <Badge className={`${deliveryStatusClassName[delivery.status]} rounded-full border px-3 py-1`}>
                        {deliveryStatusLabel[delivery.status]}
                      </Badge>
                    </td>
                    <td className="border-t border-[#F8F5EF]/10 px-4 py-4 group-hover:bg-[#102033]">
                      <span className={hasPdf(delivery) ? 'text-emerald-300' : 'text-[#F8F5EF]/45'}>
                        {getPdfKindLabel(delivery)}
                      </span>
                    </td>
                    <td className="border-t border-[#F8F5EF]/10 px-4 py-4 text-right group-hover:bg-[#102033]">
                      {renderActions(delivery)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grid max-h-[calc(100vh-300px)] gap-3 overflow-auto p-3 xl:hidden">
          {loading ? (
            <div className="rounded-lg border border-[#F8F5EF]/10 bg-[#070D1D] p-5 text-center text-sm text-[#F8F5EF]/65">
              Carregando entregas...
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="rounded-lg border border-[#F8F5EF]/10 bg-[#070D1D] p-5 text-center text-sm text-[#F8F5EF]/65">
              Nenhum pedido encontrado.
            </div>
          ) : (
            filteredDeliveries.map((delivery) => (
              <article key={delivery.id} className="rounded-lg border border-[#F8F5EF]/10 bg-[#070D1D] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{delivery.nome || 'Cliente'}</h4>
                    <p className="mt-1 text-sm text-[#F8F5EF]/60">{getProductLabel(delivery.produto)}</p>
                    <p className="mt-1 text-xs text-[#F8F5EF]/50">{getFormattedPhone(delivery)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getPaymentClassName(delivery)} rounded-full border px-3 py-1`}>
                      {getPaymentLabel(delivery)}
                    </Badge>
                    <Badge className={`${deliveryStatusClassName[delivery.status]} rounded-full border px-3 py-1`}>
                      {deliveryStatusLabel[delivery.status]}
                    </Badge>
                    <Badge className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/65">
                      PDF: {getPdfKindLabel(delivery).toLocaleLowerCase('pt-BR')}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">{renderActions(delivery)}</div>
              </article>
            ))
          )}
        </div>
      </section>

      <Dialog open={!!whatsAppDelivery} onOpenChange={() => setWhatsAppDelivery(null)}>
        <DialogContent className="border-[#C9A96E]/30 bg-[#0B1426] text-[#F8F5EF] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-400" />
              Enviar WhatsApp
            </DialogTitle>
          </DialogHeader>

          {whatsAppDelivery && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#C9A96E]/20 bg-[#070D1D] p-3 text-sm">
                <p className="font-semibold text-white">{whatsAppDelivery.nome}</p>
                <p className="mt-1 text-[#F8F5EF]/65">{getFormattedPhone(whatsAppDelivery)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-message" className={premiumClasses.label}>Mensagem</Label>
                <Textarea
                  id="whatsapp-message"
                  value={whatsAppMessage}
                  onChange={(event) => setWhatsAppMessage(event.target.value)}
                  className={`${premiumClasses.textarea} min-h-44`}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="border-[#F8F5EF]/25 bg-transparent text-[#F8F5EF] hover:bg-[#F8F5EF]/10 hover:text-white"
              onClick={() => setWhatsAppDelivery(null)}
            >
              Cancelar
            </Button>
            <Button className="bg-[#1F9D66] text-white hover:bg-[#26B979]" onClick={handleSendWhatsApp} disabled={!!sendingId}>
              {sendingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailsDelivery} onOpenChange={(open) => !open && setDetailsDelivery(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-[#C9A96E]/30 bg-[#0B1426] text-[#F8F5EF] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dados do pedido</DialogTitle>
          </DialogHeader>
          {detailsDelivery && (() => {
            const data = detailsDelivery.dadosCliente || {};
            const labels = data.campoLabels && typeof data.campoLabels === 'object' && !Array.isArray(data.campoLabels)
              ? data.campoLabels as Record<string, unknown>
              : {};
            return (
              <div className="space-y-5">
                <div className="grid gap-3 rounded-xl border border-white/10 bg-[#07101d] p-4 sm:grid-cols-2">
                  <div><p className="text-xs text-white/45">Cliente</p><p className="mt-1 font-semibold text-white">{detailsDelivery.nome}</p></div>
                  <div><p className="text-xs text-white/45">Produto</p><p className="mt-1 font-semibold text-white">{getProductLabel(detailsDelivery.produto)}</p></div>
                  <div><p className="text-xs text-white/45">WhatsApp</p><p className="mt-1 text-white/80">{getFormattedPhone(detailsDelivery)}</p></div>
                  <div><p className="text-xs text-white/45">E-mail</p><p className="mt-1 break-all text-white/80">{detailsDelivery.email || 'Não informado'}</p></div>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Briefing do serviço</h4>
                  <dl className="mt-3 grid gap-3">
                    {Object.entries(data).filter(([key]) => !['campoLabels', 'pdfKind'].includes(key)).map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-white/10 p-3">
                        <dt className="text-xs font-semibold text-[#C9A96E]">{typeof labels[key] === 'string' ? String(labels[key]) : humanizeKey(key)}</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sm text-white/75">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || 'Não informado')}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div><p className="text-xs text-white/45">Status</p><Badge className={`${deliveryStatusClassName[detailsDelivery.status]} mt-2 border`}>{deliveryStatusLabel[detailsDelivery.status]}</Badge></div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};
