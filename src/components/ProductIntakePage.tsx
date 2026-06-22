import React, { useMemo, useState } from 'react';
import { ArrowLeft, Loader2, MessageCircle, Send, Sparkles } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getCatalogProduct } from '@/config/catalogProducts';
import { getProductIntakeFields } from '@/config/productIntakeFields';
import { carolWhatsappNumber } from '@/config/env';
import { deliveryService } from '@/services/deliveryService';
import { formatBrazilianPhone, isValidBrazilianPhone, normalizeBrazilianPhone } from '@/utils/phoneUtils';

const FRIENDLY_ERROR = 'Não conseguimos salvar seu pedido agora. Tente novamente ou fale com a Carol pelo WhatsApp.';

export const ProductIntakePage: React.FC = () => {
  const { productId = '' } = useParams();
  const product = getCatalogProduct(productId);
  const fields = useMemo(() => getProductIntakeFields(productId), [productId]);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Record<string, string>>({
    nome: profile?.full_name || profile?.name || '',
    email: profile?.email || user?.email || '',
  });

  if (!product || product.journeyType !== 'auto_contratacao') return <Navigate to="/loja" replace />;

  const updateField = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: key === 'telefone' ? formatBrazilianPhone(value) : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const missing = fields.find((field) => field.required && !form[field.key]?.trim());
    if (missing) {
      setError(`Preencha o campo “${missing.label}” para continuar.`);
      return;
    }
    if (!isValidBrazilianPhone(form.telefone || '')) {
      setError('Informe um WhatsApp válido para a Carol entrar em contato.');
      return;
    }
    if (!user?.id) {
      setError('Sua sessão expirou. Entre novamente para continuar.');
      return;
    }

    setSaving(true);
    try {
      const labels = Object.fromEntries(fields.map((field) => [field.key, field.label]));
      const normalizedForm = Object.fromEntries(fields.map((field) => [
        field.key,
        field.type === 'date' && !form[field.key]?.trim() ? null : form[field.key] || '',
      ]));
      await deliveryService.createDelivery({
        userId: user.id,
        nome: form.nome.trim(),
        telefone: form.telefone,
        telefoneNormalizado: normalizeBrazilianPhone(form.telefone),
        email: form.email.trim(),
        produto: product.key,
        tipoProduto: product.productType,
        status: 'AGUARDANDO_PAGAMENTO',
        dataNascimento: form.dataNascimento || null,
        linkPdf: null,
        pdfDataUrl: null,
        fileName: null,
        pdfStoragePath: null,
        origem: 'plataforma',
        observacoesCliente: form.observacoesCliente,
        observacoesCarol: '',
        dadosNumerologicos: {},
        dadosCliente: {
          ...normalizedForm,
          campoLabels: labels,
          produto: product.key,
          produtoNome: product.name,
          categoria: product.category,
          tipoProduto: product.productType,
          journeyType: product.journeyType,
          preco: product.price,
          formato: product.format,
          entrega: product.delivery,
          pdfTemplateKey: product.pdfTemplateKey,
          etapa: 'aguardando_pagamento',
          origem: 'formulario_contratacao',
        },
      });
      navigate('/portal');
    } catch (technicalError) {
      console.error('[ProductIntakePage] Falha técnica ao criar pedido', technicalError);
      setError(FRIENDLY_ERROR);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06101d] px-4 py-6 text-[#f8f5ef] sm:py-10">
      <main className="mx-auto w-full max-w-3xl">
        <Button asChild variant="ghost" className="mb-5 px-0 text-[#f8f5ef]/70 hover:bg-transparent hover:text-white">
          <Link to="/loja"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para produtos</Link>
        </Button>

        <section className="rounded-3xl border border-[#d7b878]/25 bg-[#0b1828]/95 p-5 shadow-2xl shadow-black/25 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d7b878]/10">
              <Sparkles className="h-5 w-5 text-[#d7b878]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d7b878]">{product.category}</p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{product.name}</h1>
              <p className="mt-2 text-sm leading-6 text-[#f8f5ef]/65">Preencha as informações para a Carol preparar sua análise com cuidado.</p>
            </div>
          </div>

          {product.key === 'data_cesarea' && (
            <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
              A decisão médica vem sempre em primeiro lugar. A numerologia é apenas um apoio simbólico para datas já autorizadas pelo médico.
            </div>
          )}

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={`intake-${field.key}`} className="text-[#f8f5ef]/85">{field.label}{field.required ? ' *' : ''}</Label>
                {field.type === 'textarea' ? (
                  <Textarea id={`intake-${field.key}`} value={form[field.key] || ''} onChange={(event) => updateField(field.key, event.target.value)} className="mt-2 min-h-28 border-white/10 bg-[#07101d] text-white" />
                ) : field.type === 'select' ? (
                  <select id={`intake-${field.key}`} value={form[field.key] || ''} onChange={(event) => updateField(field.key, event.target.value)} className="mt-2 h-12 w-full rounded-md border border-white/10 bg-[#07101d] px-3 text-white">
                    <option value="">Selecione</option>
                    {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <Input id={`intake-${field.key}`} type={field.type} value={form[field.key] || ''} placeholder={field.placeholder} onChange={(event) => updateField(field.key, event.target.value)} className="mt-2 h-12 border-white/10 bg-[#07101d] text-white" />
                )}
              </div>
            ))}

            {error && (
              <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
                <p>{error}</p>
                {error === FRIENDLY_ERROR && (
                  <Button asChild variant="outline" className="mt-3 border-emerald-400/35 bg-transparent text-emerald-100 hover:bg-emerald-400/10">
                    <a href={`https://wa.me/${carolWhatsappNumber}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Falar com a Carol no WhatsApp</a>
                  </Button>
                )}
              </div>
            )}

            <Button type="submit" disabled={saving} className="min-h-12 w-full bg-[#d7b878] font-bold text-[#06101d] hover:bg-[#e4c98e]">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {saving ? 'Salvando pedido...' : 'Enviar briefing e criar pedido'}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
};
