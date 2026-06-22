import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { DEV_MODE } from '@/config/devMode';
import { demoMode, hasSupabaseConfig } from '@/config/env';
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
  [key: string]: unknown;
}

type AuthMetadata = Record<string, unknown>;

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
  signUp: (email: string, password: string, metadata?: AuthMetadata) => Promise<{ success: boolean; error?: string }>;
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
const AUTH_SAFETY_TIMEOUT_MS = 3000;

const getDemoUserId = (email: string) => {
  const normalized = email.trim().toLowerCase();
  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) hash = ((hash << 5) - hash + normalized.charCodeAt(index)) | 0;
  return `demo-${Math.abs(hash)}`;
};

const getDemoRole = (email: string): AppRole => /(^|[.@+_-])(carol|admin)([.@+_-]|$)/i.test(email) ? 'admin' : 'cliente';

const getMetadataName = (metadata: AuthMetadata, fallback: string) => {
  const value = metadata.full_name || metadata.name;
  return typeof value === 'string' && value.trim() ? value : fallback;
};

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

const withSafetyTimeout = async <T,>(promise: Promise<T>, fallback: T): Promise<T> => {
  let timeoutId: ReturnType<typeof window.setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutId = window.setTimeout(() => resolve(fallback), AUTH_SAFETY_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

const fetchUserRole = async (authUser: User): Promise<AppRole> => {
  if (!supabase || !hasSupabaseConfig) return 'cliente';

  try {
    const { data, error } = await withSafetyTimeout(
      supabase
        .from('profiles')
        .select('role')
        .eq('user_id', authUser.id)
        .maybeSingle(),
      { data: null, error: null },
    );

    if (error) {
      console.error('ERRO AO BUSCAR ROLE:', error);
      return 'cliente';
    }

    if (!data?.role) return 'cliente';
    return data.role === 'admin' ? 'admin' : 'cliente';
  } catch (error) {
    console.error('ERRO AO BUSCAR ROLE:', error);
    return 'cliente';
  }
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

    let role: AppRole = 'cliente';
    let profile: AppProfile | null = null;

    try {
      role = await fetchUserRole(authUser);
      profile = createProfile(authUser, role);
      return profile;
    } catch (error) {
      console.error('ERRO AO BUSCAR ROLE:', error);
      role = 'cliente';
      profile = createProfile(authUser, role);
      return profile;
    } finally {
      const safeProfile = profile || createProfile(authUser, role);
      setState({ user: authUser, profile: safeProfile, role, loading: false, authError: null });
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadInitialSession = async () => {
      if (!supabase || !hasSupabaseConfig) {
        if (mounted) setState({ user: null, profile: null, role: null, loading: false, authError: null });
        return;
      }

      setState((current) => ({ ...current, loading: true, authError: null }));
      const { data, error } = await withSafetyTimeout(
        supabase.auth.getSession(),
        { data: { session: null }, error: null },
      );

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
      if (DEV_MODE || demoMode) {
        const role = getDemoRole(email);
        const devUser = { id: getDemoUserId(email), email, name: role === 'admin' ? 'Carol Graber' : email.split('@')[0] };
        const profile = createProfile(devUser, role);
        setState({ user: devUser, profile, role, loading: false, authError: null });
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

  const signUp = async (email: string, password: string, metadata: AuthMetadata = {}) => {
    setState((current) => ({ ...current, loading: true, authError: null }));

    if ((!supabase || !hasSupabaseConfig) && demoMode) {
      const devUser = { id: getDemoUserId(email), email, name: getMetadataName(metadata, email.split('@')[0]) };
      const profile = createProfile(devUser, 'cliente');
      setState({ user: devUser, profile, role: 'cliente', loading: false, authError: null });
      return { success: true };
    }

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

    if (data.user && data.session) {
      await applyUser(data.user);
    } else {
      setState({ user: null, profile: null, role: null, loading: false, authError: 'Conta criada. Confirme seu e-mail antes de entrar.' });
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

  const value: AuthContextType = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
