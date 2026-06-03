import { Delivery, getProductLabel } from './deliveryService';
import { isValidBrazilianPhone, normalizeBrazilianPhone } from '@/utils/phoneUtils';
import { enableWhatsappMock } from '@/config/env';

export interface WhatsAppResult {
  success: boolean;
  url?: string;
  providerMessageId?: string;
  sentAt?: string;
  mocked?: boolean;
  error?: string;
}

const getPublicPdfUrl = (value?: string | null) => {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : null;
};

export const buildDefaultWhatsAppMessage = (delivery: Delivery) => {
  const publicPdfUrl = getPublicPdfUrl(delivery.linkPdf);

  if (publicPdfUrl) {
    return [
      `Olá, ${delivery.nome}. Seu ${getProductLabel(delivery.produto)} está pronto.`,
      '',
      'Preparei seu material com cuidado e ele já está disponível neste link:',
      publicPdfUrl,
      '',
      'Com carinho,',
      'Carol Graber',
    ].join('\n');
  }

  return [
    `Olá, ${delivery.nome}. Seu ${getProductLabel(delivery.produto)} está pronto.`,
    '',
    'Preparei seu material com cuidado e ele será enviado por aqui em PDF.',
    '',
    'Com carinho,',
    'Carol Graber',
  ].join('\n');
};

export const whatsappService = {
  async sendPdfLink(delivery: Delivery, message: string): Promise<WhatsAppResult> {
    if (!delivery.linkPdf && !delivery.pdfDataUrl && !delivery.pdfStoragePath) {
      return {
        success: false,
        error: 'Gere o PDF antes de enviar pelo WhatsApp.',
      };
    }

    const phone = delivery.telefoneNormalizado || normalizeBrazilianPhone(delivery.telefone);

    if (!phone || !isValidBrazilianPhone(phone)) {
      return {
        success: false,
        error: 'Informe um telefone/WhatsApp válido para enviar o PDF.',
      };
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    if (enableWhatsappMock) {
      return {
        success: true,
        url,
        mocked: true,
        providerMessageId: `mock-${Date.now()}`,
        sentAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      url,
      sentAt: new Date().toISOString(),
    };
  },
};
