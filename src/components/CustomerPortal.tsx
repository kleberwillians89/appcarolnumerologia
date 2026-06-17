import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Download, FileText, Loader2, MessageCircle, Phone, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Delivery, DeliveryStatus, deliveryService, getProductLabel, isValidUuid } from '@/services/deliveryService';
import { pdfStorageService } from '@/services/pdfStorageService';
import { generatePdfForProduct } from '@/services/pdfDeliveryService';
import { sendLeadToGoogleSheets } from '@/services/googleSheetsService';
import { formatBrazilianPhone, isValidBrazilianPhone, normalizeBrazilianPhone } from '@/utils/phoneUtils';
import { premiumClasses } from '@/config/premiumClasses';
import { WHATSAPP_URL } from '@/config/links';

const statusLabel: Record<string, string> = {
  DADOS_RECEBIDOS: 'Dados recebidos',
  AGUARDANDO_DADOS: 'Aguardando dados',
  PRONTO_PARA_GERAR_PDF: 'Pronto para gerar PDF',
  AGUARDANDO_ANALISE: 'Análise manual',
  PDF_GERADO: 'PDF disponível',
  PDF_ENVIADO: 'PDF enviado',
};

const initialForm = {
  nome: '',
  telefone: '',
  email: '',
  dataNascimento: '',
  produto: 'mapa' as 'mapa' | 'ano_pessoal',
  observacoesCliente: '',
};

export const CustomerPortal: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<'mapa' | 'ano_pessoal'>('mapa');

  const userId = user?.id || '';
  const activeDelivery = deliveries.find((delivery) =>
    delivery.status === 'AGUARDANDO_DADOS' ||
    !delivery.nome ||
    !delivery.telefone ||
    !delivery.dataNascimento
  );
  const shouldShowForm = showForm || Boolean(activeDelivery);

  const loadDeliveries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await deliveryService.fetchDeliveriesForCurrentUser(userId);
      setDeliveries(data);

      const urlEntries = await Promise.all(data.map(async (delivery) => {
        const url = await pdfStorageService.getPdfUrlForDelivery(delivery);
        return url ? [delivery.id, url] as const : null;
      }));

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
  }, [userId]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      nome: current.nome || profile?.full_name || profile?.name || '',
      email: current.email || profile?.email || user?.email || '',
    }));
  }, [profile, user?.email]);

  useEffect(() => {
    if (!activeDelivery) return;

    setForm((current) => ({
      ...current,
      nome: activeDelivery.nome || current.nome || profile?.full_name || profile?.name || '',
      telefone: activeDelivery.telefone ? formatBrazilianPhone(activeDelivery.telefone) : current.telefone,
      email: activeDelivery.email || current.email || user?.email || '',
      dataNascimento: activeDelivery.dataNascimento || current.dataNascimento,
      produto: activeDelivery.produto,
      observacoesCliente: activeDelivery.observacoesCliente || current.observacoesCliente,
    }));
    setSelectedProduct(activeDelivery.produto);
    setShowForm(true);
  }, [activeDelivery?.id]);

  useEffect(() => {
    void loadDeliveries();
  }, [loadDeliveries]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
        title: 'Telefone obrigatório',
        description: 'Informe o telefone/WhatsApp do cliente para criar a entrega.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const telefoneNormalizado = normalizeBrazilianPhone(form.telefone);
      const status: DeliveryStatus = 'PRONTO_PARA_GERAR_PDF';
      const existingDelivery = activeDelivery || deliveries.find((delivery) =>
        delivery.produto === form.produto &&
        delivery.status !== 'PDF_GERADO' &&
        delivery.status !== 'PDF_ENVIADO'
      );
      const deliveryPayload = {
        userId,
        nome: form.nome.trim(),
        telefone: form.telefone,
        telefoneNormalizado,
        email: form.email.trim() || user?.email || '',
        produto: form.produto,
        status,
        dataNascimento: form.dataNascimento,
        linkPdf: null,
        pdfDataUrl: null,
        fileName: null,
        origem: 'plataforma',
        observacoesCliente: form.observacoesCliente,
        observacoesCarol: '',
        dadosNumerologicos: {},
        dadosCliente: {
          nome: form.nome.trim(),
          telefone: form.telefone,
          telefoneNormalizado,
          email: form.email.trim() || user?.email || '',
          dataNascimento: form.dataNascimento,
          produto: form.produto,
          origem: 'plataforma',
          observacoesCliente: form.observacoesCliente,
        },
      };

      const delivery = existingDelivery
        ? await deliveryService.updateDelivery(existingDelivery.id, deliveryPayload)
        : await deliveryService.createDelivery(deliveryPayload);

      void sendLeadToGoogleSheets({
        nome: delivery.nome,
        telefone: delivery.telefone,
        telefoneNormalizado: delivery.telefoneNormalizado,
        email: delivery.email,
        produto: delivery.produto,
        dataNascimento: delivery.dataNascimento,
        status: delivery.status,
        origem: delivery.origem,
        observacoesCliente: delivery.observacoesCliente,
        createdAt: delivery.dataCriacao,
      });

      toast({
        title: 'Dados enviados',
        description: existingDelivery ? 'Sua entrega foi atualizada.' : 'Sua entrega foi criada e já aparece na sua área.',
      });
      setDeliveries((current) => {
        const exists = current.some((item) => item.id === delivery.id);
        return exists
          ? current.map((item) => item.id === delivery.id ? delivery : item)
          : [delivery, ...current];
      });
      setLastSavedAt(new Date().toISOString());
      setShowForm(false);
      setForm({ ...initialForm, nome: form.nome, email: form.email });
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

  const handleStartProduct = () => {
    setForm((current) => ({
      ...current,
      produto: selectedProduct,
      nome: current.nome || profile?.full_name || profile?.name || '',
      email: current.email || profile?.email || user?.email || '',
    }));
    setShowForm(true);
  };

  const handleGeneratePdf = async (delivery: Delivery) => {
    if (!delivery.nome || !delivery.dataNascimento) {
      toast({
        title: 'Dados incompletos',
        description: 'Informe nome e data de nascimento antes de gerar o PDF.',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingPdfId(delivery.id);
    try {
      const result = await generatePdfForProduct({
        produto: delivery.produto,
        cliente: {
          nome: delivery.nome,
          dataNascimento: delivery.dataNascimento,
          telefone: formatBrazilianPhone(delivery.telefoneNormalizado || delivery.telefone),
          email: delivery.email,
        },
        dadosNumerologicos: delivery.dadosNumerologicos || {},
        origem: 'plataforma',
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
      const pdfUrl = await pdfStorageService.getPdfUrlForDelivery(updatedDelivery);

      setDeliveries((current) => current.map((item) => item.id === updatedDelivery.id ? updatedDelivery : item));
      if (pdfUrl) {
        setPdfUrls((current) => ({ ...current, [updatedDelivery.id]: pdfUrl }));
      }

      toast({
        title: 'PDF gerado',
        description: `${getProductLabel(updatedDelivery.produto)} ficou disponível na sua área.`,
      });
    } catch (error) {
      toast({
        title: 'Não foi possível gerar o PDF',
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPdfId(null);
    }
  };

  return (
    <div className={premiumClasses.page}>
      <header className={premiumClasses.header}>
        <div className="container mx-auto px-4 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[#C9A96E] text-xs font-semibold tracking-[0.3em]">CAROL GRABER</p>
            <h1 className="text-2xl font-bold text-white">Minha área</h1>
          </div>
          <Button variant="outline" className={`${premiumClasses.secondaryButton} w-full sm:w-auto`} onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {!loading && deliveries.length === 0 && !shouldShowForm && (
          <Card className={premiumClasses.card}>
            <CardHeader>
              <CardTitle className="text-white">Bem-vindo à sua área</CardTitle>
              <p className={premiumClasses.muted}>Aqui você poderá preencher seus dados, acompanhar suas leituras e acessar seus PDFs.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-[#C9A96E]/25 bg-[#070D1D]/80 p-4">
                <h3 className="font-semibold text-white">Nenhum produto ativo ainda</h3>
                <p className={`mt-2 text-sm ${premiumClasses.muted}`}>
                  Escolha um produto para preencher seus dados e gerar o PDF quando estiver pronto.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <select
                  value={selectedProduct}
                  onChange={(event) => setSelectedProduct(event.target.value as 'mapa' | 'ano_pessoal')}
                  className={premiumClasses.select}
                >
                  <option value="mapa">Mapa da Alma</option>
                  <option value="ano_pessoal">Ano Pessoal</option>
                </select>
                <Button className={premiumClasses.primaryButton} onClick={handleStartProduct}>
                  Escolher produto
                </Button>
                <Button variant="outline" className={premiumClasses.secondaryButton} onClick={loadDeliveries}>
                  Atualizar
                </Button>
              </div>

              <Button asChild variant="outline" className={`${premiumClasses.secondaryButton} w-full sm:w-auto`}>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Tirar dúvida pelo WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {shouldShowForm && (
          <Card className={premiumClasses.card}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UserRound className="w-5 h-5 text-[#C9A96E]" />
                Preencher dados
              </CardTitle>
              <p className={premiumClasses.muted}>Preencha suas informações para liberar o cálculo e a geração do PDF.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customer-name" className={premiumClasses.label}>Nome completo</Label>
                <Input id="customer-name" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={premiumClasses.input} required />
              </div>
              <div>
                <Label htmlFor="customer-phone" className={premiumClasses.label}>Telefone / WhatsApp</Label>
                <Input
                  id="customer-phone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: formatBrazilianPhone(e.target.value) })}
                  placeholder="(11) 99999-9999"
                  className={premiumClasses.input}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer-email" className={premiumClasses.label}>E-mail (opcional)</Label>
                <Input id="customer-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={premiumClasses.input} />
              </div>
              <div>
                <Label htmlFor="customer-birth" className={premiumClasses.label}>Data de nascimento</Label>
                <Input id="customer-birth" type="date" value={form.dataNascimento} onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} className={premiumClasses.input} required />
              </div>
              <div>
                <Label htmlFor="customer-product" className={premiumClasses.label}>Produto</Label>
                <select
                  id="customer-product"
                  value={form.produto}
                  onChange={(e) => setForm({ ...form, produto: e.target.value as 'mapa' | 'ano_pessoal' })}
                  className={premiumClasses.select}
                  disabled={Boolean(activeDelivery)}
                >
                  <option value="mapa">Mapa da Alma</option>
                  <option value="ano_pessoal">Ano Pessoal</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="customer-notes" className={premiumClasses.label}>Observações</Label>
                <Textarea id="customer-notes" value={form.observacoesCliente} onChange={(e) => setForm({ ...form, observacoesCliente: e.target.value })} className={premiumClasses.textarea} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Button type="submit" disabled={saving} className={`${premiumClasses.primaryButton} w-full sm:w-auto`}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  {saving ? 'Salvando...' : 'Salvar dados'}
                </Button>
                {lastSavedAt && <p className="text-sm text-[#C9A96E]">Dados salvos com sucesso.</p>}
              </div>
              </form>
            </CardContent>
          </Card>
        )}

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Meus produtos</h2>
          {loading ? (
            <div className={`flex items-center gap-2 ${premiumClasses.muted}`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando entregas...
            </div>
          ) : deliveries.length === 0 ? (
            <Card className={premiumClasses.cardAlt}>
              <CardContent className="py-8">Nenhum produto ativo ainda.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deliveries.map((delivery) => (
                <Card key={delivery.id} className={premiumClasses.cardAlt}>
                  <CardContent className="py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{getProductLabel(delivery.produto)}</h3>
                      <div className={`mt-2 flex flex-wrap gap-3 text-sm ${premiumClasses.muted}`}>
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#C9A96E]" />{delivery.dataNascimento}</span>
                        <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-[#C9A96E]" />{formatBrazilianPhone(delivery.telefoneNormalizado || delivery.telefone)}</span>
                      </div>
                      <p className="mt-2 text-sm text-[#C9A96E]">{statusLabel[delivery.status] || delivery.status}</p>
                    </div>
                    {pdfUrls[delivery.id] ? (
                      <Button asChild className={`${premiumClasses.primaryButton} w-full sm:w-auto`}>
                        <a href={pdfUrls[delivery.id]} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Baixar PDF
                        </a>
                      </Button>
                    ) : (
                      <Button
                        className={`${premiumClasses.primaryButton} w-full sm:w-auto`}
                        onClick={() => handleGeneratePdf(delivery)}
                        disabled={generatingPdfId === delivery.id}
                      >
                        {generatingPdfId === delivery.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                        {generatingPdfId === delivery.id ? 'Gerando...' : 'Gerar PDF'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
