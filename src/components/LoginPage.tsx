import React, { useState } from 'react';
import { demoMode, hasSupabaseConfig } from '@/config/env';
import { useAuth } from '../contexts/AuthContext';
import { premiumClasses } from '@/config/premiumClasses';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const BG_URL =
  'https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760768485419_3523f9cb.png';

const HEADER_IMG_URL =
  'https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760982979637_3171a8f6.png';

export default function LoginPage({ adminOnly = false }: { adminOnly?: boolean }) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, authError, refreshProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = mode === 'signIn' || adminOnly
      ? await signIn(email, password)
      : await signUp(email, password, { full_name: name, name, role: 'cliente' });

    if (!result.success) {
      setError(result.error || 'Não foi possível autenticar.');
    }

    setIsSubmitting(false);
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetSent(false);
    if (!email.trim()) {
      setError('Informe seu e-mail para receber o link de redefinição.');
      return;
    }
    if (!supabase) {
      setError('O serviço de acesso não está disponível agora. Tente novamente mais tarde.');
      return;
    }

    sessionStorage.setItem('carol_password_recovery_return', adminOnly ? '/admin/login' : '/login');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    if (resetError) {
      console.error('[LoginPage] Falha ao solicitar redefinição', resetError.message);
      setError('Não foi possível enviar o link agora. Confira o e-mail e tente novamente.');
      return;
    }
    setResetSent(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-black px-4">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-no-repeat bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url("${BG_URL}")` }}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/65" />
      </div>

      <DecorativeNumbers />

      <div className="relative w-full max-w-md rounded-3xl border border-yellow-500/40 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-black/50 p-8 sm:p-10 animate-slide-up">
        <div className="mb-6 -mt-4 overflow-hidden rounded-2xl">
          <img
            src={HEADER_IMG_URL}
            alt="Carol Graber Numerologia"
            className="w-full h-auto object-cover shadow-lg animate-header-fade-slide hover:scale-105 transition-transform duration-500"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-white text-4xl sm:text-5xl font-extrabold tracking-tight">Carol Graber</h1>
          <p className="mt-2 text-yellow-400 font-bold tracking-[0.35em]">NUMEROLOGIA</p>
          <div className="mt-4 h-[2px] w-28 mx-auto bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
          <p className="mt-4 text-slate-300">
            {adminOnly ? 'Acesso exclusivo da Carol' : mode === 'signIn' ? 'Entre para acessar sua área' : 'Crie seu acesso de cliente'}
          </p>
        </div>

        {!hasSupabaseConfig && !demoMode && (
          <div className="mb-5 rounded-xl border border-[#C9A96E]/50 bg-[#C9A96E]/10 px-4 py-3 text-[#F8F5EF] text-sm">
            Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env.local` para usar o login real.
          </div>
        )}

        {demoMode && (
          <div className="mb-5 rounded-xl border border-sky-400/35 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
            Demonstração local: use um e-mail contendo “carol” ou “admin” para entrar como Carol. Outros e-mails entram como cliente.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signUp' && !adminOnly && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${premiumClasses.label}`}>Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl px-4 py-3.5 outline-none transition ${premiumClasses.input}`}
                placeholder="Seu nome"
                required
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${premiumClasses.label}`}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl px-4 py-3.5 outline-none transition ${premiumClasses.input}`}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${premiumClasses.label}`}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-xl px-4 py-3.5 outline-none transition ${premiumClasses.input}`}
              placeholder="••••••••"
              required
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            />
          </div>

          {(error || authError) && (
            <div role="alert" className="rounded-xl border border-red-500/50 bg-red-500/15 px-4 py-3 text-red-200 text-sm">
              <p>{error || authError}</p>
              {authError?.includes('perfil') && (
                <button type="button" className="mt-3 font-semibold text-yellow-200 underline" onClick={() => void refreshProfile()}>
                  Tentar novamente
                </button>
              )}
            </div>
          )}

          {resetSent && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              Enviamos um link para redefinir sua senha.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-xl py-3.5 shadow-xl shadow-[#C9A96E]/20 disabled:opacity-60 active:scale-[0.99] transition ${premiumClasses.primaryButton}`}
          >
            {isSubmitting ? 'Aguarde...' : adminOnly ? 'Entrar no Centro de Comando' : mode === 'signIn' ? 'Entrar' : 'Criar acesso'}
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-2 text-center text-sm">
          {!adminOnly && (
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                setError('');
              }}
              className="text-yellow-300 hover:text-yellow-200"
            >
              {mode === 'signIn' ? 'Criar acesso, se for cliente' : 'Já tenho acesso'}
            </button>
          )}
          <Link className="text-yellow-300 hover:text-yellow-200" to={adminOnly ? '/login' : '/admin/login'}>
            {adminOnly ? 'Voltar para o acesso de clientes' : 'Acesso Carol / Admin'}
          </Link>
          <button type="button" className="text-slate-300 hover:text-white" onClick={() => void handleForgotPassword()}>
            Esqueci minha senha
          </button>
        </div>
      </div>
    </div>
  );
}

function DecorativeNumbers() {
  const base = 'pointer-events-none absolute select-none font-extrabold leading-none text-yellow-300/15';
  return (
    <>
      <div className={`${base} top-6 left-4 text-[22vw] sm:text-[18vw] md:text-[15vw] animate-float-slow`}>1</div>
      <div className={`${base} top-14 right-6 text-[20vw] sm:text-[16vw] md:text-[13vw] animate-float-slower`}>3</div>
      <div className={`${base} bottom-10 left-20 text-[18vw] sm:text-[14vw] md:text-[12vw] animate-float-slow`}>5</div>
      <div className={`${base} bottom-6 right-10 text-[22vw] sm:text-[18vw] md:text-[15vw] animate-float-slower`}>2</div>
    </>
  );
}
