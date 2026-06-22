import React, { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';

const RECOVERY_KEY = 'carol_password_recovery_params';
const RETURN_KEY = 'carol_password_recovery_return';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const prepareRecoverySession = async () => {
      if (!supabase) {
        setError('O serviço de acesso não está configurado. Solicite um novo link.');
        setChecking(false);
        return;
      }

      try {
        const stored = sessionStorage.getItem(RECOVERY_KEY);
        const routeQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
        const params = new URLSearchParams(stored || routeQuery || window.location.search.slice(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (sessionError) throw sessionError;
          sessionStorage.removeItem(RECOVERY_KEY);
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !data.session) throw sessionError || new Error('Sessão de recuperação ausente.');
        setValidSession(true);
      } catch {
        sessionStorage.removeItem(RECOVERY_KEY);
        setError('Este link de redefinição expirou ou é inválido. Solicite um novo link na tela de acesso.');
      } finally {
        setChecking(false);
      }
    };

    void prepareRecoverySession();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!supabase || !validSession) {
      setError('O link não está mais válido. Solicite uma nova redefinição.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      console.error('[ResetPasswordPage] Falha ao atualizar senha', updateError.message);
      setError('Não foi possível atualizar sua senha. Solicite um novo link e tente novamente.');
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    const returnPath = sessionStorage.getItem(RETURN_KEY) || '/login';
    sessionStorage.removeItem(RETURN_KEY);
    await supabase.auth.signOut();
    window.setTimeout(() => navigate(returnPath, { replace: true }), 1600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06101d] px-4 py-10 text-[#f8f5ef]">
      <main className="w-full max-w-md rounded-3xl border border-[#d7b878]/30 bg-[#0b1828] p-6 shadow-2xl shadow-black/30 sm:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d7b878]/10">
          {success ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> : <KeyRound className="h-6 w-6 text-[#d7b878]" />}
        </div>
        <h1 className="mt-5 text-center text-2xl font-semibold text-white">Criar nova senha</h1>
        <p className="mt-2 text-center text-sm leading-6 text-white/60">Escolha uma senha segura para acessar a plataforma Carol Graber.</p>

        {checking ? (
          <div className="mt-8 flex items-center justify-center text-sm text-white/60"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validando seu link...</div>
        ) : success ? (
          <div className="mt-8 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center text-emerald-100">Senha atualizada com sucesso. Redirecionando para o acesso...</div>
        ) : validSession ? (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div><Label htmlFor="new-password">Nova senha</Label><Input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} className="mt-2 h-12 border-white/10 bg-[#07101d] text-white" autoComplete="new-password" /></div>
            <div><Label htmlFor="confirm-password">Confirmar nova senha</Label><Input id="confirm-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} className="mt-2 h-12 border-white/10 bg-[#07101d] text-white" autoComplete="new-password" /></div>
            {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</div>}
            <Button type="submit" disabled={saving} className="h-12 w-full bg-[#d7b878] font-bold text-[#06101d] hover:bg-[#e4c98e]">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Atualizar senha</Button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm leading-6 text-red-100">{error}</div>
            <Button asChild variant="outline" className="h-12 w-full border-[#d7b878]/30 bg-transparent text-white"><Link to="/login">Solicitar novo link</Link></Button>
          </div>
        )}
      </main>
    </div>
  );
};
