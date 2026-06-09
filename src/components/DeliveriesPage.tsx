import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Download, Eye, FileText, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DADOS_RECEBIDOS: 'Dados recebidos',
  AGUARDANDO_DADOS: 'Aguardando dados',
  PRONTO_PARA_GERAR_PDF: 'Pronto para gerar PDF',
  AGUARDANDO_ANALISE: 'Pendente',
  PDF_GERADO: 'PDF gerado',
  PDF_ENVIADO: 'PDF enviado',
};

const statusClassName: Record<DeliveryStatus, string> = {
  DADOS_RECEBIDOS: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  AGUARDANDO_DADOS: 'bg-yellow-500/15 text-yellow-100 border-yellow-500/30',
  PRONTO_PARA_GERAR_PDF: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/30',
  AGUARDANDO_ANALISE: 'bg-orange-500/15 text-orange-200 border-orange-500/30',
  PDF_GERADO: 'bg-blue-500/15 text-blue-200 border-blue-500/30',
  PDF_ENVIADO: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
};

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

const statusOptions: DeliveryStatus[] = [
  'DADOS_RECEBIDOS',
  'AGUARDANDO_DADOS',
  'AGUARDANDO_ANALISE',
  'PRONTO_PARA_GERAR_PDF',
  'PDF_GERADO',
  'PDF_ENVIADO',
];

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [whatsAppDelivery, setWhatsAppDelivery] = useState<Delivery | null>(null);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const { toast } = useToast();

  const downloadDeliveryPdf = (delivery: Delivery) => {
    if (delivery.pdfDataUrl && delivery.fileName) {
      const link = document.createElement('a');
      link.href = delivery.pdfDataUrl;
      link.download = delivery.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (delivery.linkPdf && delivery.linkPdf.startsWith('http')) {
      window.open(delivery.linkPdf, '_blank', 'noopener,noreferrer');
      return;
    }

    toast({
      title: 'PDF indisponível',
      description: 'Gere o PDF novamente para baixar o arquivo local.',
      variant: 'destructive',
    });
  };

  const upsertVisibleDelivery = (updatedDelivery: Delivery) => {
    setDeliveries((currentDeliveries) => {
      const index = currentDeliveries.findIndex((delivery) =>
        delivery.id === updatedDelivery.id ||
        Boolean(delivery.localId && updatedDelivery.localId && delivery.localId === updatedDelivery.localId)
      );

      if (index === -1) return [updatedDelivery, ...currentDeliveries];

      return currentDeliveries.map((delivery, currentIndex) =>
        currentIndex === index ? { ...delivery, ...updatedDelivery } : delivery
      );
    });

    setSelectedDelivery((current) =>
      current && (current.id === updatedDelivery.id || current.localId === updatedDelivery.localId)
        ? { ...current, ...updatedDelivery }
        : current
    );

    setWhatsAppDelivery((current) =>
      current && (current.id === updatedDelivery.id || current.localId === updatedDelivery.localId)
        ? { ...current, ...updatedDelivery }
        : current
    );
  };

  const loadDeliveries = async () => {
    setIsLoadingDeliveries(true);
    try {
      const loadedDeliveries = await deliveryService.fetchDeliveriesForAdmin();
      setDeliveries(loadedDeliveries);
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
        acc[delivery.status] += 1;
        return acc;
      },
      {
        DADOS_RECEBIDOS: 0,
        AGUARDANDO_DADOS: 0,
        PRONTO_PARA_GERAR_PDF: 0,
        AGUARDANDO_ANALISE: 0,
        PDF_GERADO: 0,
        PDF_ENVIADO: 0,
      } as Record<DeliveryStatus, number>
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
        produto: delivery.produto,
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

      const updatedDelivery = await deliveryService.updateDeliveryPdf(delivery, {
        linkPdf,
        pdfDataUrl: result.pdfDataUrl,
        fileName: result.fileName,
        pdfStoragePath,
      });
      upsertVisibleDelivery(updatedDelivery);

      toast({
        title: 'PDF gerado',
        description: `${getProductLabel(delivery.produto)} de ${delivery.nome} ficou pronto para envio.`,
      });
    } finally {
      setIsGenerating(null);
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

      const updatedDelivery = await deliveryService.markDeliveryAsSent(whatsAppDelivery, result.sentAt || new Date().toISOString());
      upsertVisibleDelivery(updatedDelivery);
      setWhatsAppDelivery(null);
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
      if (status === 'PDF_GERADO' && !hasDeliveryPdf(delivery)) {
        await handleGeneratePdf(delivery);
        return;
      }

      if (status === 'PDF_ENVIADO' && !hasDeliveryPdf(delivery)) {
        toast({
          title: 'PDF necessário',
          description: 'Gere o PDF antes de marcar a entrega como enviada.',
          variant: 'destructive',
        });
        return;
      }

      const updatedDelivery = await deliveryService.updateDeliveryStatus(delivery.id, status);
      upsertVisibleDelivery(updatedDelivery);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-yellow-500 text-sm font-semibold tracking-[0.2em]">OPERAÇÃO</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Entregas</h2>
          <p className="text-slate-300 mt-2 max-w-2xl">
            Fila de produtos, PDFs e envios por WhatsApp conectada ao Supabase quando o ambiente está configurado.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-yellow-500/20 bg-slate-900/70 px-4 py-3">
            <p className="text-xl font-bold text-white">{totals.DADOS_RECEBIDOS + totals.AGUARDANDO_DADOS + totals.PRONTO_PARA_GERAR_PDF + totals.AGUARDANDO_ANALISE}</p>
            <p className="text-xs text-slate-300">Fila</p>
          </div>
          <div className="rounded-lg border border-yellow-500/20 bg-slate-900/70 px-4 py-3">
            <p className="text-xl font-bold text-white">{totals.PDF_GERADO}</p>
            <p className="text-xs text-slate-300">PDFs</p>
          </div>
          <div className="rounded-lg border border-yellow-500/20 bg-slate-900/70 px-4 py-3">
            <p className="text-xl font-bold text-white">{totals.PDF_ENVIADO}</p>
            <p className="text-xs text-slate-300">Enviadas</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {isLoadingDeliveries ? (
          <Card className="border border-yellow-500/20 bg-slate-900/70 text-white">
            <CardContent className="py-8 text-slate-200">Carregando entregas...</CardContent>
          </Card>
        ) : deliveries.map((delivery) => (
          <Card key={delivery.id} className="overflow-hidden border border-yellow-500/20 bg-slate-900/75 text-white shadow-lg shadow-black/10">
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl leading-tight text-white">{delivery.nome}</CardTitle>
                    <Badge className={statusClassName[delivery.status] || premiumClasses.badge}>{statusLabel[delivery.status]}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-200">
                    <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-yellow-400" />{getFormattedDeliveryPhone(delivery)}</span>
                    {delivery.email && <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-yellow-400" />{delivery.email}</span>}
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-yellow-400" />{formatDate(delivery.dataNascimento)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                  <Button variant="outline" className={premiumClasses.secondaryButton} onClick={() => setSelectedDelivery(delivery)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver dados
                  </Button>
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-300"
                    onClick={() => openWhatsAppModal(delivery)}
                    disabled={!canSendWhatsApp(delivery)}
                    title={!canSendWhatsApp(delivery) ? 'Para enviar WhatsApp, gere o PDF e informe o telefone do cliente.' : undefined}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar WhatsApp
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-md bg-white/[0.04] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Produto</p>
                  <p className="mt-1 text-sm font-medium text-slate-50">{getProductLabel(delivery.produto)}</p>
                </div>
                <div className="rounded-md bg-white/[0.04] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-medium text-slate-50">{statusLabel[delivery.status]}</p>
                </div>
                <div className="rounded-md bg-white/[0.04] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Criada em</p>
                  <p className="mt-1 text-sm font-medium text-slate-50">{formatDateTime(delivery.dataCriacao)}</p>
                </div>
                <div className="rounded-md bg-white/[0.04] p-3 sm:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Arquivo/PDF</p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-50">{getPdfLabel(delivery)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="w-full max-w-sm">
                  <Label htmlFor={`status-${delivery.id}`} className="text-xs font-medium text-slate-300">Atualizar status</Label>
                  <select
                    id={`status-${delivery.id}`}
                    value={delivery.status}
                    onChange={(event) => handleStatusChange(delivery, event.target.value as DeliveryStatus)}
                    className={`mt-1 ${premiumClasses.select}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{statusLabel[status]}</option>
                    ))}
                  </select>
                </div>

                {hasDeliveryPdf(delivery) ? (
                  <Button className={`${premiumClasses.secondaryButton} w-full sm:w-auto`} onClick={() => downloadDeliveryPdf(delivery)}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </Button>
                ) : (
                  <Button className={`${premiumClasses.primaryButton} w-full sm:w-auto`} onClick={() => handleGeneratePdf(delivery)} disabled={isGenerating === delivery.id}>
                    <FileText className="mr-2 h-4 w-4" />
                    {isGenerating === delivery.id ? 'Gerando...' : 'Gerar PDF'}
                  </Button>
                )}
              </div>
              {!canSendWhatsApp(delivery) && (
                <p className="text-xs text-slate-300">Para enviar WhatsApp, gere o PDF e informe o telefone do cliente.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent className="sm:max-w-2xl border-[#C9A96E]/30 bg-[#0B1426] text-[#F8F5EF]">
          <DialogHeader>
            <DialogTitle>Dados da entrega</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[#F8F5EF]/65">ID</p><p className="font-medium">{selectedDelivery.id}</p></div>
                <div><p className="text-[#F8F5EF]/65">Status</p><p className="font-medium">{statusLabel[selectedDelivery.status]}</p></div>
                <div><p className="text-[#F8F5EF]/65">Nome</p><p className="font-medium">{selectedDelivery.nome}</p></div>
                <div><p className="text-[#F8F5EF]/65">Produto</p><p className="font-medium">{getProductLabel(selectedDelivery.produto)}</p></div>
                <div><p className="text-[#F8F5EF]/65">Telefone</p><p className="font-medium">{getFormattedDeliveryPhone(selectedDelivery)}</p></div>
                <div><p className="text-[#F8F5EF]/65">Email</p><p className="font-medium">{selectedDelivery.email || 'Não informado'}</p></div>
                <div><p className="text-[#F8F5EF]/65">Nascimento</p><p className="font-medium">{formatDate(selectedDelivery.dataNascimento)}</p></div>
                <div><p className="text-[#F8F5EF]/65">Origem</p><p className="font-medium">{selectedDelivery.origem}</p></div>
                <div><p className="text-[#F8F5EF]/65">Criacao</p><p className="font-medium">{formatDateTime(selectedDelivery.dataCriacao)}</p></div>
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
              <Send className="w-5 h-5 text-emerald-600" />
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
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSendWhatsApp} disabled={!!isSending}>
              {isSending ? 'Enviando...' : 'Abrir WhatsApp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
