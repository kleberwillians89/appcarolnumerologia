import React, { useState } from 'react';
import { ArrowRight, CalendarDays, Check, LogOut, MessageCircle, MoonStar, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CATALOG_GROUPS, CATALOG_PRODUCTS, CatalogProduct } from '@/config/catalogProducts';
import { carolCalendarUrl, carolWhatsappNumber, whatsappUrl } from '@/config/env';

export const ProductCatalogPage: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [unavailableProduct, setUnavailableProduct] = useState<string | null>(null);
  const whatsappHref = whatsappUrl || `https://wa.me/${carolWhatsappNumber}`;

  const handleProductAction = (product: CatalogProduct) => {
    setUnavailableProduct(null);
    if (product.journeyType === 'auto_contratacao') {
      navigate(`/contratar/${product.key}`);
      return;
    }

    const calendarUrl = product.calendarUrl || carolCalendarUrl;
    if (calendarUrl) {
      window.open(calendarUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setUnavailableProduct(product.key);
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

        <div className="mt-14 space-y-14">
          {CATALOG_GROUPS.map((group) => (
            <section key={group}>
              <div className="mb-6 flex items-center gap-4">
                <h2 className="shrink-0 text-xl font-semibold text-white sm:text-2xl">{group}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-[#d7b878]/40 to-transparent" />
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {CATALOG_PRODUCTS.filter((product) => product.group === group).map((product) => (
            <article
              key={product.key}
              className="group flex min-w-0 flex-col rounded-3xl border border-white/10 bg-[#0b1828]/90 p-5 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-[#d7b878]/45 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7b878]/25 bg-[#d7b878]/10">
                  <Sparkles className="h-5 w-5 text-[#e4c98e]" />
                </div>
                <span className="rounded-full border border-[#d7b878]/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#d7b878]">{product.category}</span>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#d7b878]">{product.shortName}</p>
              <h2 className="mt-2 break-words text-2xl font-semibold text-white">{product.name}</h2>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#f8f5ef]/65">{product.description}</p>
              <div className="mt-4 space-y-2 rounded-2xl bg-white/[0.03] p-4 text-xs leading-5 text-[#f8f5ef]/60">
                <p><span className="font-semibold text-[#f8f5ef]/85">Formato:</span> {product.format}</p>
                <p><span className="font-semibold text-[#f8f5ef]/85">Entrega:</span> {product.delivery}</p>
              </div>

              <ul className="mt-5 space-y-3 border-t border-white/10 pt-5">
                {product.benefits.map((item) => (
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
                  onClick={() => handleProductAction(product)}
                >
                  {product.journeyType === 'atendimento' ? <CalendarDays className="mr-2 h-4 w-4 shrink-0" /> : <ArrowRight className="mr-2 h-4 w-4 shrink-0" />}
                  {product.buttonLabel}
                </Button>
                {unavailableProduct === product.key && (
                  <div className="mt-3 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm leading-5 text-amber-100">
                    <p>Agenda da Carol indisponível no momento. Fale com ela pelo WhatsApp.</p>
                    <Button asChild variant="outline" className="mt-3 h-10 w-full border-emerald-400/35 bg-transparent text-emerald-100 hover:bg-emerald-400/10">
                      <a href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Falar com a Carol</a>
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
              </div>
            </section>
          ))}
        </div>

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
