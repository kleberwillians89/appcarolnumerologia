import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createFallbackProfile = (user: User | LegacyUser, role: AppRole = 'admin'): AppProfile => ({
  id: user.id || 'dev-profile',
  user_id: user.id || 'dev-user',
  email: user.email,
  full_name: user.name || user.email,
  name: user.name || user.email,
  role,
});

const mapProfile = (data: any, user: User): AppProfile => ({
  id: data?.id || user.id,
  user_id: data?.user_id || data?.id || user.id,
  email: data?.email || user.email,
  full_name: data?.full_name || data?.name || user.user_metadata?.full_name || user.email,
  name: data?.name || data?.full_name || user.user_metadata?.name || user.user_metadata?.full_name || user.email,
  role: data?.role === 'admin' ? 'admin' : 'cliente',
  ...data,
});

const basicProfilePayload = (authUser: User, role: AppRole = 'cliente') => ({
  user_id: authUser.id,
  email: authUser.email,
  full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email,
  name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email,
  role,
  updated_at: new Date().toISOString(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | LegacyUser | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadProfileForUser = useCallback(async (authUser: User) => {
    const { data, error } = await supabase!
      .from('profiles')
      .select('id,user_id,email,full_name,name,role,created_at,updated_at')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (error) {
      setAuthError(error.message);
      const fallback = createFallbackProfile(authUser, 'cliente');
      setProfile(fallback);
      return fallback;
    }

    if (!data) {
      const fallback = mapProfile(basicProfilePayload(authUser), authUser);
      setProfile(fallback);

      supabase!
        .from('profiles')
        .upsert(basicProfilePayload(authUser), { onConflict: 'user_id' })
        .then(({ error: upsertError }) => {
          if (upsertError) setAuthError(upsertError.message);
        });

      return fallback;
    }

    const mapped = mapProfile(data, authUser);
    setProfile(mapped);
    return mapped;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!supabase || !hasSupabaseConfig) {
      if (DEV_MODE && user) {
        const fallback = createFallbackProfile(user);
        setProfile(fallback);
        return fallback;
      }
      setProfile(null);
      return null;
    }

    const { data: authData, error: userError } = await supabase.auth.getUser();
    if (userError || !authData.user) {
      setUser(null);
      setProfile(null);
      return null;
    }

    setUser(authData.user);
    return loadProfileForUser(authData.user);
  }, [loadProfileForUser, user]);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      setLoading(true);
      setAuthError(null);

      try {
        if (!supabase || !hasSupabaseConfig) {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        const authUser = data.session?.user || null;

        if (error || !authUser) {
          if (error) setAuthError(error.message);
          setUser(null);
          setProfile(null);
          return;
        }

        setUser(authUser);
        try {
          await loadProfileForUser(authUser);
        } catch (profileError) {
          if (!mounted) return;
          setAuthError(profileError instanceof Error ? profileError.message : 'Não foi possível carregar o perfil.');
          setProfile(createFallbackProfile(authUser, 'cliente'));
        }
      } catch (error) {
        if (!mounted) return;
        setAuthError(error instanceof Error ? error.message : 'Não foi possível carregar a sessão.');
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSession();

    const { data: listener } = supabase?.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setLoading(true);

      try {
        setUser(session?.user || null);
        if (session?.user) {
          await loadProfileForUser(session.user);
        } else {
          setProfile(null);
        }
      } catch (error) {
        if (!mounted) return;
        setAuthError(error instanceof Error ? error.message : 'Não foi possível atualizar a sessão.');
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }) || { data: null };

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);

    if (!supabase || !hasSupabaseConfig) {
      if (DEV_MODE) {
        const fallbackUser = { id: 'dev-user', email, name: 'Carol Graber' };
        setUser(fallbackUser);
        setProfile(createFallbackProfile(fallbackUser, 'admin'));
        return { success: true };
      }

      const error = 'Supabase não configurado. Crie o arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.';
      setAuthError(error);
      return { success: false, error };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }

    if (data.user) {
      setUser(data.user);
      await loadProfileForUser(data.user);
    }
    return { success: true };
  };

  const signUp = async (email: string, password: string, metadata: Record<string, any> = {}) => {
    setAuthError(null);

    if (!supabase || !hasSupabaseConfig) {
      const error = 'Supabase não configurado. Configure o .env.local antes de criar acessos.';
      setAuthError(error);
      return { success: false, error };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        user_id: data.user.id,
        email,
        full_name: metadata.full_name || metadata.name || email,
        name: metadata.name || metadata.full_name || email,
        role: metadata.role === 'admin' ? 'admin' : 'cliente',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      setUser(data.user);
      await loadProfileForUser(data.user);
    } else {
      setAuthError('Verifique seu e-mail para confirmar o acesso.');
    }

    return { success: true };
  };

  const signOut = async () => {
    setAuthError(null);

    try {
      if (supabase && hasSupabaseConfig) {
        const { error } = await supabase.auth.signOut();
        if (error) setAuthError(error.message);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.');
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    return result.success;
  };

  const value = useMemo<AuthContextType>(() => {
    const role = profile?.role || null;
    return {
      user,
      profile,
      role,
      isAdmin: role === 'admin',
      isCliente: role === 'cliente',
      loading,
      authError,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      login,
      logout: signOut,
      isAuthenticated: Boolean(user),
    };
  }, [user, profile, loading, authError, loadProfileForUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
