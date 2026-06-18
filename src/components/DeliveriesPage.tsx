import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Crown,
  Eye,
  FileCheck2,
  FileText,
  Mail,
  MessageCircle,
  PackageCheck,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Delivery, DeliveryStatus, deliveryService, getProductLabel, isValidUuid } from '@/services/deliveryService';
import { generatePdfForProduct } from '@/services/pdfDeliveryService';
import { buildDefaultWhatsAppMessage, whatsappService } from '@/services/whatsappService';
import { formatBrazilianPhone, isValidBrazilianPhone } from '@/utils/phoneUtils';
import { pdfStorageService } from '@/services/pdfStorageService';
import { premiumClasses } from '@/config/premiumClasses';

const statusLabel: Record<DeliveryStatus, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PAGO: 'Pago',
  DADOS_RECEBIDOS: 'Dados recebidos',
  AGUARDANDO_DADOS: 'Aguardando dados',
  PRONTO_PARA_GERAR_PDF: 'Pronto para gerar',
  AGUARDANDO_ANALISE: 'Análise manual',
  PDF_GERADO: 'PDF gerado',
  PDF_ENVIADO: 'Entregue',
};

const statusClassName: Record<DeliveryStatus, string> = {
  AGUARDANDO_PAGAMENTO: 'border-yellow-400/30 bg-yellow-400/15 text-yellow-100',
  PAGO: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100',
  DADOS_RECEBIDOS: 'border-yellow-400/30 bg-yellow-400/15 text-yellow-100',
  AGUARDANDO_DADOS: 'border-yellow-400/30 bg-yellow-400/15 text-yellow-100',
  PRONTO_PARA_GERAR_PDF: 'border-sky-400/30 bg-sky-400/15 text-sky-100',
  AGUARDANDO_ANALISE: 'border-orange-400/30 bg-orange-400/15 text-orange-100',
  PDF_GERADO: 'border-blue-400/30 bg-blue-400/15 text-blue-100',
  PDF_ENVIADO: 'border-violet-400/30 bg-violet-400/15 text-violet-100',
};

const statusOptions: DeliveryStatus[] = [
  'AGUARDANDO_PAGAMENTO',
  'PAGO',
  'DADOS_RECEBIDOS',
  'AGUARDANDO_DADOS',
  'PRONTO_PARA_GERAR_PDF',
  'AGUARDANDO_ANALISE',
  'PDF_GERADO',
  'PDF_ENVIADO',
];

const formatDate = (value: string | null) => {
  if (!value) return 'Não informado';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const formatDateTime = (value: string | null) => {
  if (!value) return 'Ainda não enviado';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const getDeliveryPhone = (delivery: Delivery) => delivery.telefoneNormalizado || delivery.telefone || '';

const getFormattedDeliveryPhone = (delivery: Delivery) => {
  const phone = getDeliveryPhone(delivery);
  return phone ? formatBrazilianPhone(phone) : 'Telefone pendente';
};

const hasDeliveryPdf = (delivery: Delivery) => Boolean(delivery.linkPdf || delivery.pdfDataUrl || delivery.pdfStoragePath);

const canSendWhatsApp = (delivery: Delivery) => hasDeliveryPdf(delivery) && isValidBrazilianPhone(getDeliveryPhone(delivery));

const getPdfLabel = (delivery: Delivery) => {
  if (delivery.fileName) return delivery.fileName;
  if (delivery.linkPdf) return delivery.linkPdf.startsWith('http') ? 'Link público disponível' : 'PDF gerado localmente';
  if (delivery.pdfDataUrl || delivery.pdfStoragePath) return 'PDF gerado';
  return 'Ainda não gerado';
};

const isOperationalQueue = (status: DeliveryStatus) =>
  status === 'PAGO' ||
  status === 'DADOS_RECEBIDOS' ||
  status === 'AGUARDANDO_DADOS' ||
  status === 'PRONTO_PARA_GERAR_PDF' ||
  status === 'AGUARDANDO_ANALISE';

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [whatsAppDelivery, setWhatsAppDelivery] = useState<Delivery | null>(null);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const { toast } = useToast();

  const loadDeliveries = async () => {
    setIsLoadingDeliveries(true);
    try {
      setDeliveries(await deliveryService.fetchDeliveriesForAdmin());
    } catch (error) {
      toast({
        title: 'Erro ao carregar entregas',
        description: error instanceof Error ? error.message : 'Verifique a conexão com o Supabase.',
        variant: 'destructive',
      });
      setDeliveries(deliveryService.listDeliveries());
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  useEffect(() => {
    loadDeliveries();

    const handleUpdate = () => void loadDeliveries();
    window.addEventListener('deliveriesUpdated', handleUpdate);
    return () => window.removeEventListener('deliveriesUpdated', handleUpdate);
  }, []);

  const totals = useMemo(() => {
    return deliveries.reduce(
      (acc, delivery) => {
        acc.total += 1;
        if (delivery.status === 'AGUARDANDO_PAGAMENTO') acc.pending += 1;
        if (delivery.status === 'PAGO') acc.paid += 1;
        if (hasDeliveryPdf(delivery) || delivery.status === 'PDF_GERADO' || delivery.status === 'PDF_ENVIADO') acc.pdfs += 1;
        if (isOperationalQueue(delivery.status)) acc.queue += 1;
        return acc;
      },
      { total: 0, pending: 0, paid: 0, pdfs: 0, queue: 0 }
    );
  }, [deliveries]);

  const handleGeneratePdf = async (delivery: Delivery) => {
    setIsGenerating(delivery.id);
    try {
      if (!delivery.telefone || !isValidBrazilianPhone(getDeliveryPhone(delivery))) {
        toast({
          title: 'Telefone obrigatório',
          description: 'Informe o telefone/WhatsApp do cliente para gerar o PDF e criar a entrega.',
          variant: 'destructive',
        });
        return;
      }

      const result = await generatePdfForProduct({
        produto: delivery.produto === 'ano_pessoal' ? 'ano_pessoal' : 'mapa',
        cliente: {
          nome: delivery.nome,
          dataNascimento: delivery.dataNascimento,
          telefone: getFormattedDeliveryPhone(delivery),
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

      let linkPdf = result.linkPdf;
      let pdfStoragePath: string | null = null;

      if (isValidUuid(delivery.id) && result.fileName && result.pdfDataUrl) {
        const upload = await pdfStorageService.uploadPdf({
          dataUrl: result.pdfDataUrl,
          fileName: result.fileName,
          deliveryId: delivery.id,
          userId: delivery.userId,
        });

        if (upload.success && upload.path) {
          pdfStoragePath = upload.path;
          const signed = await pdfStorageService.createSignedPdfUrl(upload.path);
          linkPdf = signed.signedUrl || linkPdf;
          await pdfStorageService.createPdfFileRecord({
            deliveryId: delivery.id,
            userId: delivery.userId,
            fileName: result.fileName,
            path: upload.path,
            signedUrl: signed.signedUrl,
          });
        }
      }

      await deliveryService.updateDeliveryPdf(delivery, {
        linkPdf,
        pdfDataUrl: result.pdfDataUrl,
        fileName: result.fileName,
        pdfStoragePath,
      });

      toast({
        title: 'PDF gerado',
        description: `${getProductLabel(delivery.produto)} de ${delivery.nome} ficou pronto para envio.`,
      });
    } finally {
      setIsGenerating(null);
      await loadDeliveries();
    }
  };

  const openWhatsAppModal = (delivery: Delivery) => {
    setWhatsAppDelivery(delivery);
    setWhatsAppMessage(buildDefaultWhatsAppMessage(delivery));
  };

  const handleSendWhatsApp = async () => {
    if (!whatsAppDelivery) return;

    setIsSending(whatsAppDelivery.id);
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

      await deliveryService.markDeliveryAsSent(whatsAppDelivery, result.sentAt || new Date().toISOString());
      setWhatsAppDelivery(null);
      await loadDeliveries();
      toast({
        title: 'WhatsApp aberto',
        description: 'A entrega foi marcada como PDF enviado.',
      });
    } catch (error) {
      toast({
        title: 'Não foi possível concluir o envio',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(null);
    }
  };

  const handleStatusChange = async (delivery: Delivery, status: DeliveryStatus) => {
    try {
      await deliveryService.updateDeliveryStatus(delivery.id, status);
      await loadDeliveries();
      toast({
        title: 'Status atualizado',
        description: `${delivery.nome} agora está como ${statusLabel[status]}.`,
      });
    } catch (error) {
      toast({
        title: 'Não foi possível atualizar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const kpis = [
    { label: 'Total de Pedidos', value: totals.total, icon: Crown, tone: 'text-[#C9A96E]' },
    { label: 'Pedidos Pendentes', value: totals.pending, icon: Clock3, tone: 'text-yellow-200' },
    { label: 'Pedidos Pagos', value: totals.paid, icon: CreditCard, tone: 'text-emerald-200' },
    { label: "PDF's Gerados", value: totals.pdfs, icon: FileCheck2, tone: 'text-sky-200' },
  ];

  return (
    <div className="space-y-6 text-[#F8F5EF]">
      <section className="overflow-hidden rounded-lg border border-[#C9A96E]/25 bg-[#0B1426]/95 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#C9A96E]">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-semibold tracking-[0.28em]">CENTRO DE COMANDO</p>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Entregas da Carol</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F8F5EF]/70">
              Acompanhe pagamentos, formulários, PDFs e envios em uma visão operacional única.
            </p>
          </div>
          <div className="rounded-md border border-[#C9A96E]/20 bg-[#070D1D]/80 px-4 py-3 text-sm text-[#F8F5EF]/75">
            <span className="text-[#C9A96E]">{totals.queue}</span> pedidos em fila operacional
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <Card key={item.label} className="border border-[#C9A96E]/25 bg-[#0B1426]/90 text-[#F8F5EF] shadow-lg shadow-black/15">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-3xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-sm text-[#F8F5EF]/65">{item.label}</p>
              </div>
              <div className="rounded-md border border-[#F8F5EF]/10 bg-[#070D1D] p-3">
                <item.icon className={`h-6 w-6 ${item.tone}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-[#C9A96E]/25 bg-[#0B1426]/95 shadow-xl shadow-black/20">
        <div className="border-b border-[#F8F5EF]/10 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Operação em tempo real</h3>
              <p className="text-sm text-[#F8F5EF]/60">Pagamento, produção e entrega em uma única esteira.</p>
            </div>
            <Badge className="w-fit border-[#C9A96E]/35 bg-[#C9A96E]/15 text-[#F8F5EF]">
              {deliveries.length} registros
            </Badge>
          </div>
        </div>

        <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.9fr_1.2fr] gap-4 border-b border-[#F8F5EF]/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#F8F5EF]/45 xl:grid">
          <span>Cliente</span>
          <span>Produto</span>
          <span>Status</span>
          <span>Pagamento</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="space-y-3 p-3 sm:p-4">
          {isLoadingDeliveries ? (
            <div className="rounded-lg border border-[#F8F5EF]/10 bg-[#070D1D]/70 p-6 text-sm text-[#F8F5EF]/65">
              Carregando entregas...
            </div>
          ) : deliveries.length === 0 ? (
            <div className="rounded-lg border border-[#F8F5EF]/10 bg-[#070D1D]/70 p-6 text-sm text-[#F8F5EF]/65">
              Nenhum pedido encontrado.
            </div>
          ) : deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="grid gap-4 rounded-lg border border-[#F8F5EF]/10 bg-[#070D1D]/70 p-4 transition-all hover:border-[#C9A96E]/45 hover:bg-[#0B2535]/70 hover:shadow-lg hover:shadow-black/20 xl:grid-cols-[1.2fr_1fr_0.8fr_0.9fr_1.2fr] xl:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-white">{delivery.nome}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-[#F8F5EF]/60 hover:bg-[#F8F5EF]/10 hover:text-white"
                    onClick={() => setSelectedDelivery(delivery)}
                    title="Ver dados"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#F8F5EF]/60">
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#C9A96E]" />{getFormattedDeliveryPhone(delivery)}</span>
                  {delivery.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#C9A96E]" />{delivery.email}</span>}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-white">{getProductLabel(delivery.produto)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#F8F5EF]/55">
                  <Calendar className="h-3.5 w-3.5 text-[#C9A96E]" />
                  {formatDate(delivery.dataNascimento)}
                </p>
              </div>

              <div>
                <Badge className={`${statusClassName[delivery.status] || premiumClasses.badge} rounded-full border px-3 py-1`}>
                  {statusLabel[delivery.status]}
                </Badge>
              </div>

              <div className="space-y-2">
                <select
                  value={delivery.status}
                  onChange={(event) => handleStatusChange(delivery, event.target.value as DeliveryStatus)}
                  className={premiumClasses.select}
                  aria-label="Status de pagamento"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{statusLabel[status]}</option>
                  ))}
                </select>
                <p className="text-xs text-[#F8F5EF]/45">{getPdfLabel(delivery)}</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
                {!hasDeliveryPdf(delivery) && (
                  <Button
                    className={`${premiumClasses.primaryButton} w-full sm:w-auto`}
                    onClick={() => handleGeneratePdf(delivery)}
                    disabled={isGenerating === delivery.id}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {isGenerating === delivery.id ? 'Gerando...' : 'Gerar PDF'}
                  </Button>
                )}
                <Button
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-[#111827] disabled:text-[#F8F5EF]/35 sm:w-auto"
                  onClick={() => openWhatsAppModal(delivery)}
                  disabled={!canSendWhatsApp(delivery)}
                  title={!canSendWhatsApp(delivery) ? 'Para enviar WhatsApp, gere o PDF e informe o telefone do cliente.' : undefined}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent className="sm:max-w-2xl border-[#C9A96E]/30 bg-[#0B1426] text-[#F8F5EF]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-[#C9A96E]" />
              Dados da entrega
            </DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><p className="text-[#F8F5EF]/65">ID</p><p className="font-medium">{selectedDelivery.id}</p></div>
                <div><p className="text-[#F8F5EF]/65">Status</p><p className="font-medium">{statusLabel[selectedDelivery.status]}</p></div>
                <div><p className="text-[#F8F5EF]/65">Nome</p><p className="font-medium">{selectedDelivery.nome}</p></div>
                <div><p className="text-[#F8F5EF]/65">Produto</p><p className="font-medium">{getProductLabel(selectedDelivery.produto)}</p></div>
                <div><p className="text-[#F8F5EF]/65">Telefone</p><p className="font-medium">{getFormattedDeliveryPhone(selectedDelivery)}</p></div>
                <div><p className="text-[#F8F5EF]/65">Email</p><p className="font-medium">{selectedDelivery.email || 'Não informado'}</p></div>
                <div><p className="text-[#F8F5EF]/65">Nascimento</p><p className="font-medium">{formatDate(selectedDelivery.dataNascimento)}</p></div>
                <div><p className="text-[#F8F5EF]/65">Origem</p><p className="font-medium">{selectedDelivery.origem}</p></div>
                <div><p className="text-[#F8F5EF]/65">Criação</p><p className="font-medium">{formatDateTime(selectedDelivery.dataCriacao)}</p></div>
                <div><p className="text-[#F8F5EF]/65">Envio</p><p className="font-medium">{formatDateTime(selectedDelivery.dataEnvio)}</p></div>
              </div>
              <div>
                <p className="text-[#F8F5EF]/65">Arquivo</p>
                <p className="break-all font-medium">{selectedDelivery.fileName || 'PDF ainda não gerado'}</p>
              </div>
              <div>
                <p className="text-[#F8F5EF]/65">Link do PDF</p>
                <p className="break-all font-medium">{selectedDelivery.linkPdf || 'PDF ainda não gerado'}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><p className="text-[#F8F5EF]/65">Observações do cliente</p><p>{selectedDelivery.observacoesCliente || '-'}</p></div>
                <div><p className="text-[#F8F5EF]/65">Observações internas</p><p>{selectedDelivery.observacoesCarol || '-'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!whatsAppDelivery} onOpenChange={() => setWhatsAppDelivery(null)}>
        <DialogContent className="sm:max-w-xl border-[#C9A96E]/30 bg-[#0B1426] text-[#F8F5EF]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              Confirmar envio por WhatsApp
            </DialogTitle>
          </DialogHeader>

          {whatsAppDelivery && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#C9A96E]/25 bg-[#070D1D] p-3 text-sm">
                <p className="font-medium">{whatsAppDelivery.nome}</p>
                <p className={premiumClasses.muted}>{getFormattedDeliveryPhone(whatsAppDelivery)} - {getProductLabel(whatsAppDelivery.produto)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-message" className={premiumClasses.label}>Mensagem</Label>
                <Textarea
                  id="whatsapp-message"
                  value={whatsAppMessage}
                  onChange={(event) => setWhatsAppMessage(event.target.value)}
                  className={`min-h-44 ${premiumClasses.textarea}`}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className={premiumClasses.secondaryButton} onClick={() => setWhatsAppDelivery(null)}>Cancelar</Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={handleSendWhatsApp} disabled={!!isSending}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isSending ? 'Enviando...' : 'Abrir WhatsApp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
