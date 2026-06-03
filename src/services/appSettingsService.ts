import { DEV_MODE } from '@/config/devMode';
import { hasSupabaseConfig } from '@/config/env';
import { supabase } from '@/lib/supabaseClient';

const LOCAL_SETTINGS_KEY = 'carol_app_settings';

const readLocalSettings = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeLocalSetting = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  const settings = readLocalSettings();
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify({ ...settings, [key]: value }));
};

export const appSettingsService = {
  async getSetting<T = any>(key: string): Promise<T | null> {
    if (supabase && hasSupabaseConfig) {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (!error) return (data?.value ?? null) as T | null;
    }

    if (DEV_MODE || !hasSupabaseConfig) {
      return (readLocalSettings()[key] ?? null) as T | null;
    }

    return null;
  },

  async saveSetting(key: string, value: any) {
    if (supabase && hasSupabaseConfig) {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (!error) return { success: true };
      if (!DEV_MODE) return { success: false, error: error.message };
    }

    writeLocalSetting(key, value);
    return { success: true, mocked: true };
  },
};
