import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { DEV_MODE } from '@/config/devMode';
import { hasSupabaseConfig } from '@/config/env';
import { supabase } from '@/lib/supabaseClient';

export type AppRole = 'admin' | 'cliente';

export interface AppProfile {
  id: string;
  user_id: string;
  email?: string | null;
  full_name?: string | null;
  name?: string | null;
  role: AppRole;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any;
}

interface LegacyUser {
  id?: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | LegacyUser | null;
  profile: AppProfile | null;
  role: AppRole | null;
  isAdmin: boolean;
  isCliente: boolean;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<AppProfile | null>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

type AuthState = {
  user: User | LegacyUser | null;
  profile: AppProfile | null;
  role: AppRole | null;
  loading: boolean;
  authError: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUserDisplayName = (user: User | LegacyUser) => {
  if ('name' in user && user.name) return user.name;
  return user.user_metadata?.full_name || user.user_metadata?.name || user.email || '';
};

const createProfile = (user: User | LegacyUser, role: AppRole): AppProfile => ({
  id: user.id || 'dev-profile',
  user_id: user.id || 'dev-user',
  email: user.email,
  full_name: getUserDisplayName(user),
  name: getUserDisplayName(user),
  role,
});

const fetchUserRole = async (authUser: User): Promise<AppRole> => {
  if (!supabase || !hasSupabaseConfig) return 'cliente';

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', authUser.id)
    .single();

  if (error || !data?.role) return 'cliente';
  return data.role === 'admin' ? 'admin' : 'cliente';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
    authError: null,
  });

  const applyUser = async (authUser: User | null) => {
    if (!authUser) {
      setState({ user: null, profile: null, role: null, loading: false, authError: null });
      return null;
    }

    setState((current) => ({ ...current, loading: true, authError: null }));
    const role = await fetchUserRole(authUser);
    const profile = createProfile(authUser, role);
    setState({ user: authUser, profile, role, loading: false, authError: null });
    return profile;
  };

  useEffect(() => {
    let mounted = true;

    const loadInitialSession = async () => {
      if (!supabase || !hasSupabaseConfig) {
        if (mounted) setState({ user: null, profile: null, role: null, loading: false, authError: null });
        return;
      }

      setState((current) => ({ ...current, loading: true, authError: null }));
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setState({ user: null, profile: null, role: null, loading: false, authError: error.message });
        return;
      }

      await applyUser(data.session?.user || null);
    };

    loadInitialSession();

    const { data: listener } = supabase?.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setState((current) => ({ ...current, loading: true, authError: null }));
      await applyUser(session?.user || null);
    }) || { data: null };

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!supabase || !hasSupabaseConfig) {
      return state.profile;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setState({ user: null, profile: null, role: null, loading: false, authError: error?.message || null });
      return null;
    }

    return applyUser(data.user);
  };

  const signIn = async (email: string, password: string) => {
    setState((current) => ({ ...current, loading: true, authError: null }));

    if (!supabase || !hasSupabaseConfig) {
      if (DEV_MODE) {
        const devUser = { id: 'dev-user', email, name: 'Carol Graber' };
        const profile = createProfile(devUser, 'admin');
        setState({ user: devUser, profile, role: 'admin', loading: false, authError: null });
        return { success: true };
      }

      const error = 'Supabase não configurado. Crie o arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.';
      setState({ user: null, profile: null, role: null, loading: false, authError: error });
      return { success: false, error };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState({ user: null, profile: null, role: null, loading: false, authError: error.message });
      return { success: false, error: error.message };
    }

    await applyUser(data.user);
    return { success: true };
  };

  const signUp = async (email: string, password: string, metadata: Record<string, any> = {}) => {
    setState((current) => ({ ...current, loading: true, authError: null }));

    if (!supabase || !hasSupabaseConfig) {
      const error = 'Supabase não configurado. Configure o .env.local antes de criar acessos.';
      setState({ user: null, profile: null, role: null, loading: false, authError: error });
      return { success: false, error };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (error) {
      setState((current) => ({ ...current, loading: false, authError: error.message }));
      return { success: false, error: error.message };
    }

    if (data.user) {
      const role: AppRole = metadata.role === 'admin' ? 'admin' : 'cliente';
      await supabase.from('profiles').upsert({
        user_id: data.user.id,
        email,
        full_name: metadata.full_name || metadata.name || email,
        name: metadata.name || metadata.full_name || email,
        role,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      const profile = createProfile(data.user, role);
      setState({ user: data.user, profile, role, loading: false, authError: null });
    } else {
      setState((current) => ({ ...current, loading: false, authError: 'Verifique seu e-mail para confirmar o acesso.' }));
    }

    return { success: true };
  };

  const signOut = async () => {
    setState({ user: null, profile: null, role: null, loading: false, authError: null });
    if (supabase && hasSupabaseConfig) {
      await supabase.auth.signOut();
    }
  };

  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    return result.success;
  };

  const value = useMemo<AuthContextType>(() => ({
    user: state.user,
    profile: state.profile,
    role: state.role,
    isAdmin: state.role === 'admin',
    isCliente: state.role === 'cliente',
    loading: state.loading,
    authError: state.authError,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    login,
    logout: signOut,
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
