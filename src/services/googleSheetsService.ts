import { enableGoogleSheetsSync, googleSheetsWebhookUrl } from '@/config/env';
import { appSettingsService } from '@/services/appSettingsService';
import { PdfProductKey } from './pdfDeliveryService';

const WEBHOOK_STORAGE_KEY = 'carol_google_sheets_webhook_url';

export interface GoogleSheetsLeadPayload {
  nome: string;
  whatsapp?: string;
  telefone: string;
  telefoneNormalizado?: string;
  email?: string;
  produto: PdfProductKey | 'Mapa da Alma' | 'Ano Pessoal';
  dataNascimento: string;
  origem: string;
  status: string;
  telefoneCarol?: string;
  arquivoPdf?: string;
  observacoes?: string;
  observacoesCliente?: string;
  createdAt?: string;
}

export const getWebhookUrl = async () => {
  if (googleSheetsWebhookUrl) return googleSheetsWebhookUrl;
  const setting = await appSettingsService.getSetting<string>('google_sheets_webhook_url');
  if (setting) return setting;
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(WEBHOOK_STORAGE_KEY) || '';
};

export const saveWebhookUrl = async (url: string) => {
  await appSettingsService.saveSetting('google_sheets_webhook_url', url);
  if (typeof window !== 'undefined') {
    localStorage.setItem(WEBHOOK_STORAGE_KEY, url);
  }
};

export const getGoogleSheetsWebhookUrl = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(WEBHOOK_STORAGE_KEY) || '';
};

export const saveGoogleSheetsWebhookUrl = (url: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(WEBHOOK_STORAGE_KEY, url);
  void appSettingsService.saveSetting('google_sheets_webhook_url', url);
};

export const sendLeadToGoogleSheets = async (payload: GoogleSheetsLeadPayload) => {
  console.log('[googleSheetsService] Sync ativo:', enableGoogleSheetsSync);

  if (!enableGoogleSheetsSync) {
    console.log('[googleSheetsService] Envio ignorado: sync desativado.');
    return { success: true, mocked: true, skipped: true };
  }

  const webhookUrl = await getWebhookUrl();
  console.log('[googleSheetsService] Webhook usado:', webhookUrl || '(vazio)');

  if (!webhookUrl) {
    return {
      success: false,
      error: 'Configure a URL do Webhook Google Sheets antes de enviar.',
    };
  }

  try {
    console.log('[googleSheetsService] Payload enviado:', payload);
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    console.log('[googleSheetsService] Fetch disparado.');
    console.log('[googleSheetsService] Envio considerado sucesso.');

    return { ok: true, success: true };
  } catch (error) {
    console.warn('[googleSheetsService] Erro ao enviar para Google Sheets', error);
    return {
      ok: false,
      success: false,
      error: error instanceof Error ? error.message : error,
    };
  }
};
