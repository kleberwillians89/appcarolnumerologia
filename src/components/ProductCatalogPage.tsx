import React, { useState } from 'react';
import { ArrowRight, Check, Loader2, LogOut, MoonStar, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CATALOG_PRODUCTS, CatalogProduct } from '@/config/catalogProducts';
import { deliveryService } from '@/services/deliveryService';

interface ProductCatalogPageProps {
  onOrderCreated?: () => void | Promise<void>;
}

export const ProductCatalogPage: React.FC<ProductCatalogPageProps> = ({ onOrderCreated }) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChooseProduct = async (product: CatalogProduct) => {
    if (!user?.id) return;
    setSelectedProduct(product.key);

    try {
      await deliveryService.createDelivery({
        userId: user.id,
        nome: profile?.full_name || profile?.name || user.email || 'Cliente',
        telefone: '',
        telefoneNormalizado: '',
        email: profile?.email || user.email || '',
        produto: product.key,
        tipoProduto: product.name,
        status: 'AGUARDANDO_PAGAMENTO',
        dataNascimento: '',
        linkPdf: null,
        pdfDataUrl: null,
        fileName: null,
        pdfStoragePath: null,
        origem: 'plataforma',
        observacoesCliente: '',
        observacoesCarol: 'Pedido criado pelo catálogo de produtos.',
        dadosNumerologicos: {},
        dadosCliente: {
          produto: product.key,
          produtoNome: product.name,
          preco: product.price,
          pdfTemplateKey: product.pdfTemplateKey,
          etapa: 'aguardando_pagamento',
          origem: 'catalogo',
        },
      });

      toast({
        title: 'Seu pedido foi criado',
        description: 'Você será levado à Minha Área para acompanhar o próximo passo.',
      });
      await onOrderCreated?.();
      navigate('/portal');
    } catch (error) {
      toast({
        title: 'Não foi possível criar seu pedido',
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      });
      setSelectedProduct(null);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#06101d] text-[#f8f5ef]">
      <div className="pointer-events-none fixed inset-0 opacity-70" aria-hidden>
        <div className="absolute -left-40 -top-48 h-[32rem] w-[32rem] rounded-full bg-[#164c59]/25 blur-3xl" />
        <div className="absolute -right-40 top-28 h-[30rem] w-[30rem] rounded-full bg-[#c9a96e]/10 blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-[#06101d]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.32em] text-[#d7b878] sm:text-xs">CAROL GRABER</p>
            <p className="truncate text-lg font-semibold text-white sm:text-xl">Numerologia com propósito</p>
          </div>
          <Button variant="ghost" className="h-11 shrink-0 px-3 text-[#f8f5ef]/75 hover:bg-white/10 hover:text-white" onClick={signOut}>
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <section className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#d7b878]/35 bg-[#d7b878]/10">
            <MoonStar className="h-6 w-6 text-[#e4c98e]" />
          </div>
          <p className="text-xs font-bold tracking-[0.28em] text-[#d7b878]">UMA LEITURA FEITA PARA VOCÊ</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Clareza para compreender<br className="hidden sm:block" /> sua essência e seus ciclos
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#f8f5ef]/68 sm:text-lg">
            Escolha a análise que combina com seu momento. A Carol acompanha cada etapa e prepara sua entrega de forma personalizada.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[#f8f5ef]/70">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Acompanhamento humano</span>
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#d7b878]" /> Material personalizado</span>
          </div>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {CATALOG_PRODUCTS.map((product, index) => (
            <article
              key={product.key}
              className={`group flex min-w-0 flex-col rounded-3xl border bg-[#0b1828]/90 p-5 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-[#d7b878]/45 sm:p-6 ${
                index === 0 ? 'border-[#d7b878]/45 xl:ring-1 xl:ring-[#d7b878]/20' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7b878]/25 bg-[#d7b878]/10">
                  <Sparkles className="h-5 w-5 text-[#e4c98e]" />
                </div>
                {index === 0 && <span className="rounded-full bg-[#d7b878] px-3 py-1 text-[11px] font-bold text-[#06101d]">MAIS ESCOLHIDO</span>}
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#d7b878]">{product.shortName}</p>
              <h2 className="mt-2 break-words text-2xl font-semibold text-white">{product.name}</h2>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#f8f5ef]/65">{product.description}</p>

              <ul className="mt-5 space-y-3 border-t border-white/10 pt-5">
                {product.includes.map((item) => (
                  <li key={item} className="flex min-w-0 items-start gap-3 text-sm text-[#f8f5ef]/78">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/12">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </span>
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-7">
                <p className="text-sm text-[#f8f5ef]/50">Investimento</p>
                <p className="mt-1 text-3xl font-semibold text-[#e4c98e]">{product.price}</p>
                <Button
                  className="mt-5 min-h-12 h-auto w-full whitespace-normal break-words rounded-xl bg-[#d7b878] px-4 py-3 text-center font-bold leading-5 text-[#06101d] hover:bg-[#e4c98e]"
                  onClick={() => handleChooseProduct(product)}
                  disabled={selectedProduct !== null}
                >
                  {selectedProduct === product.key ? <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4 shrink-0" />}
                  {selectedProduct === product.key ? 'Criando seu pedido...' : 'Quero contratar'}
                </Button>
              </div>
            </article>
          ))}
        </section>

        <section className="mx-auto mt-14 max-w-4xl rounded-3xl border border-[#d7b878]/20 bg-[#0b1828]/70 p-6 text-center sm:p-8">
          <p className="text-xs font-bold tracking-[0.24em] text-[#d7b878]">COMO FUNCIONA</p>
          <div className="mt-6 grid gap-6 text-left sm:grid-cols-3">
            {['Escolha sua análise', 'Acompanhe o pagamento', 'Receba sua entrega'].map((title, index) => (
              <div key={title} className="flex gap-3 sm:block">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d7b878]/35 text-sm font-bold text-[#d7b878]">{index + 1}</span>
                <div>
                  <h3 className="sm:mt-3 font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#f8f5ef]/60">
                    {index === 0 ? 'Selecione o produto ideal para seu momento.' : index === 1 ? 'A Carol confirma e libera seus dados.' : 'Seu PDF ficará disponível na Minha Área.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
