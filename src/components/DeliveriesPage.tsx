import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle2, Clock3, Eye, FileText, Mail, MessageCircle, Phone, Search, Send, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  AGUARDANDO_ANALISE: 'Análise manual',
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
  'PRONTO_PARA_GERAR_PDF',
  'AGUARDANDO_ANALISE',
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'todos'>('todos');
  const [productFilter, setProductFilter] = useState<'todos' | 'mapa' | 'ano_pessoal'>('todos');
  const [originFilter, setOriginFilter] = useState<'todos' | Delivery['origem']>('todos');
  const [editingNotes, setEditingNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [quickStatusId, setQuickStatusId] = useState<string | null>(null);
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
    const statusTotals = deliveries.reduce(
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

    const totalClientes = new Set(
      deliveries.map((delivery) => delivery.userId || delivery.email || delivery.telefoneNormalizado || delivery.telefone || delivery.nome)
    ).size;

    return {
      ...statusTotals,
      pendentes: statusTotals.DADOS_RECEBIDOS + statusTotals.AGUARDANDO_DADOS + statusTotals.PRONTO_PARA_GERAR_PDF + statusTotals.AGUARDANDO_ANALISE,
      concluidas: statusTotals.PDF_GERADO + statusTotals.PDF_ENVIADO,
      totalClientes,
    };
  }, [deliveries]);

  const filteredDeliveries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return deliveries.filter((delivery) => {
      const matchesSearch = !normalizedSearch || [
        delivery.nome,
        delivery.email,
        delivery.telefone,
        delivery.telefoneNormalizado,
        getProductLabel(delivery.produto),
        statusLabel[delivery.status],
        delivery.observacoesCliente,
        delivery.observacoesCarol,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));

      const matchesStatus = statusFilter === 'todos' || delivery.status === statusFilter;
      const matchesProduct = productFilter === 'todos' || delivery.produto === productFilter;
      const matchesOrigin = originFilter === 'todos' || delivery.origem === originFilter;

      return matchesSearch && matchesStatus && matchesProduct && matchesOrigin;
    });
  }, [deliveries, originFilter, productFilter, searchTerm, statusFilter]);

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

  const handleQuickPdfStatus = async (delivery: Delivery) => {
    setQuickStatusId(delivery.id);
    try {
      await deliveryService.updateDeliveryStatus(delivery.id, 'PDF_GERADO');
      await loadDeliveries();
      toast({
        title: 'PDF marcado como gerado',
        description: `${delivery.nome} saiu da fila pendente.`,
      });
    } catch (error) {
      toast({
        title: 'Não foi possível atualizar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setQuickStatusId(null);
    }
  };

  const openDetailsModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setEditingNotes(delivery.observacoesCarol || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedDelivery) return;

    setIsSavingNotes(true);
    try {
      const updated = await deliveryService.updateDelivery(selectedDelivery.id, {
        observacoesCarol: editingNotes,
      });
      setSelectedDelivery(updated);
      await loadDeliveries();
      toast({
        title: 'Observações salvas',
        description: `Histórico interno de ${updated.nome} foi atualizado.`,
      });
    } catch (error) {
      toast({
        title: 'Não foi possível salvar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setProductFilter('todos');
    setOriginFilter('todos');
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

        <Button variant="outline" className={`${premiumClasses.secondaryButton} w-full md:w-auto`} onClick={loadDeliveries}>
          Atualizar fila
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-yellow-500/20 bg-slate-900/75 p-4 text-white">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Pendentes</p>
            <Clock3 className="h-5 w-5 text-yellow-400" />
          </div>
          <p className="mt-2 text-3xl font-bold">{totals.pendentes}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-slate-900/75 p-4 text-white">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Concluídas</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          </div>
          <p className="mt-2 text-3xl font-bold">{totals.concluidas}</p>
        </div>
        <div className="rounded-lg border border-cyan-500/20 bg-slate-900/75 p-4 text-white">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Total de clientes</p>
            <Users className="h-5 w-5 text-cyan-300" />
          </div>
          <p className="mt-2 text-3xl font-bold">{totals.totalClientes}</p>
        </div>
      </div>

      <div className="rounded-lg border border-yellow-500/20 bg-slate-900/70 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome, contato, status ou observação"
              className={`${premiumClasses.input} pl-9`}
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as DeliveryStatus | 'todos')} className={premiumClasses.select}>
            <option value="todos">Todos os status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{statusLabel[status]}</option>
            ))}
          </select>
          <select value={productFilter} onChange={(event) => setProductFilter(event.target.value as 'todos' | 'mapa' | 'ano_pessoal')} className={premiumClasses.select}>
            <option value="todos">Todos os produtos</option>
            <option value="mapa">Mapa da Alma</option>
            <option value="ano_pessoal">Ano Pessoal</option>
          </select>
          <select value={originFilter} onChange={(event) => setOriginFilter(event.target.value as 'todos' | Delivery['origem'])} className={premiumClasses.select}>
            <option value="todos">Todas as origens</option>
            <option value="plataforma">Plataforma</option>
            <option value="site">Site</option>
            <option value="google_sheets">Google Sheets</option>
            <option value="mock">Mock/local</option>
          </select>
          <Button variant="outline" className={premiumClasses.secondaryButton} onClick={clearFilters}>
            Limpar
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-yellow-500/20 bg-slate-900/75 text-white shadow-lg shadow-black/10">
        {isLoadingDeliveries ? (
          <div className="grid gap-3 p-4">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="border border-yellow-500/20 bg-slate-900/70 text-white">
                <CardContent className="space-y-3 py-6">
                  <Skeleton className="h-5 w-48 bg-white/10" />
                  <Skeleton className="h-4 w-full max-w-lg bg-white/10" />
                  <Skeleton className="h-10 w-full bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="flex flex-col gap-3 p-8 text-slate-200">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
              Nenhuma entrega encontrada para os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="min-w-[220px] text-slate-300">Cliente</TableHead>
                  <TableHead className="min-w-[180px] text-slate-300">Contato</TableHead>
                  <TableHead className="min-w-[140px] text-slate-300">Produto</TableHead>
                  <TableHead className="min-w-[170px] text-slate-300">Status</TableHead>
                  <TableHead className="min-w-[150px] text-slate-300">Criada em</TableHead>
                  <TableHead className="min-w-[180px] text-slate-300">PDF</TableHead>
                  <TableHead className="min-w-[310px] text-right text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id} className="border-white/10 align-top hover:bg-white/[0.03]">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{delivery.nome}</p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-yellow-400" />
                          {formatDate(delivery.dataNascimento)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm text-slate-200">
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-yellow-400" />
                          {getFormattedDeliveryPhone(delivery)}
                        </p>
                        <p className="flex items-center gap-1.5 break-all text-xs text-slate-300">
                          <Mail className="h-3.5 w-3.5 text-yellow-400" />
                          {delivery.email || 'E-mail pendente'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-100">
                      {getProductLabel(delivery.produto)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge className={statusClassName[delivery.status] || premiumClasses.badge}>
                          {statusLabel[delivery.status]}
                        </Badge>
                        <select
                          aria-label={`Atualizar status de ${delivery.nome}`}
                          value={delivery.status}
                          onChange={(event) => handleStatusChange(delivery, event.target.value as DeliveryStatus)}
                          className={`${premiumClasses.select} h-9 min-w-[160px]`}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{statusLabel[status]}</option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-200">
                      {formatDateTime(delivery.dataCriacao)}
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[180px] truncate text-sm text-slate-200" title={getPdfLabel(delivery)}>
                        {getPdfLabel(delivery)}
                      </p>
                      {!canSendWhatsApp(delivery) && (
                        <p className="mt-1 text-xs text-slate-400">WhatsApp bloqueado</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" className={premiumClasses.secondaryButton} onClick={() => openDetailsModal(delivery)}>
                          <Eye className="mr-1.5 h-4 w-4" />
                          Detalhes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={premiumClasses.secondaryButton}
                          onClick={() => handleQuickPdfStatus(delivery)}
                          disabled={delivery.status === 'PDF_GERADO' || delivery.status === 'PDF_ENVIADO' || quickStatusId === delivery.id}
                          title="Muda apenas o status operacional para PDF gerado."
                        >
                          <Zap className="mr-1.5 h-4 w-4" />
                          {quickStatusId === delivery.id ? 'Atualizando...' : 'PDF_GERADO'}
                        </Button>
                        {!hasDeliveryPdf(delivery) && (
                          <Button size="sm" className={premiumClasses.primaryButton} onClick={() => handleGeneratePdf(delivery)} disabled={isGenerating === delivery.id}>
                            <FileText className="mr-1.5 h-4 w-4" />
                            {isGenerating === delivery.id ? 'Gerando...' : 'Gerar PDF'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-300"
                          onClick={() => openWhatsAppModal(delivery)}
                          disabled={!canSendWhatsApp(delivery)}
                          title={!canSendWhatsApp(delivery) ? 'Para enviar WhatsApp, gere o PDF e informe o telefone do cliente.' : undefined}
                        >
                          <MessageCircle className="mr-1.5 h-4 w-4" />
                          WhatsApp
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
                <div className="space-y-2">
                  <Label htmlFor="internal-notes" className="text-[#F8F5EF]/65">Observações internas</Label>
                  <Textarea
                    id="internal-notes"
                    value={editingNotes}
                    onChange={(event) => setEditingNotes(event.target.value)}
                    className={`min-h-28 ${premiumClasses.textarea}`}
                    placeholder="Anote decisões, ajustes de entrega ou contexto do atendimento."
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className={premiumClasses.secondaryButton} onClick={() => setSelectedDelivery(null)}>Fechar</Button>
            <Button className={premiumClasses.primaryButton} onClick={handleSaveNotes} disabled={isSavingNotes}>
              {isSavingNotes ? 'Salvando...' : 'Salvar observações'}
            </Button>
          </DialogFooter>
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
