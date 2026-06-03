export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const enableGoogleSheetsSync = import.meta.env.VITE_ENABLE_GOOGLE_SHEETS_SYNC === 'true';
export const googleSheetsWebhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '';
export const enableWhatsappMock = import.meta.env.VITE_ENABLE_WHATSAPP_MOCK !== 'false';

export const appUrl = import.meta.env.VITE_APP_URL || 'https://app.carolgraber.com.br';
export const whatsappUrl = import.meta.env.VITE_WHATSAPP_URL || '';
export const carolWhatsappNumber = import.meta.env.VITE_CAROL_WHATSAPP_NUMBER || '5511976726050';
