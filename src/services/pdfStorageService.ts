import { hasSupabaseConfig } from '@/config/env';
import { supabase } from '@/lib/supabaseClient';
import { isValidUuid } from './deliveryService';

const BUCKET = 'pdfs';
const PROFILE_BUCKET = 'carol-pdfs';

const dataUrlToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'cliente';

export const pdfStorageService = {
  async uploadPdf({
    blob,
    dataUrl,
    fileName,
    deliveryId,
    userId,
  }: {
    blob?: Blob;
    dataUrl?: string | null;
    fileName: string;
    deliveryId: string;
    userId?: string | null;
  }) {
    if (!supabase || !hasSupabaseConfig) {
      return { success: false, error: 'Supabase Storage não configurado.' };
    }
    if (!isValidUuid(deliveryId)) {
      return { success: false, error: 'A entrega ainda não tem ID real do Supabase.' };
    }

    const fileBlob = blob || (dataUrl ? await dataUrlToBlob(dataUrl) : null);
    if (!fileBlob) {
      return { success: false, error: 'PDF não disponível para upload.' };
    }

    const safeFileName = fileName.replace(/[^a-z0-9.-]+/gi, '-').toLowerCase();
    const path = `${userId || 'admin'}/${deliveryId}/${safeFileName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, fileBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, path };
  },

  async uploadProfilePdf({
    dataUrl,
    fileName,
    clientName,
  }: {
    dataUrl?: string | null;
    fileName: string;
    clientName: string;
  }) {
    const safeFileName = fileName.replace(/[^a-z0-9.-]+/gi, '-').toLowerCase();
    const path = `mapas/${slugify(clientName)}-${Date.now()}-${safeFileName}`;

    if (!supabase || !hasSupabaseConfig) {
      console.error('[PDF Storage] Upload failed', {
        bucket: PROFILE_BUCKET,
        path,
        error: 'Supabase Storage não configurado.',
        hasPdfBlob: false,
        hasPdfFile: Boolean(dataUrl),
        hasSupabaseClient: Boolean(supabase),
      });
      return { success: false, error: 'Supabase Storage não configurado.', publicUrl: null, path };
    }

    const fileBlob = dataUrl ? await dataUrlToBlob(dataUrl) : null;
    if (!fileBlob) {
      console.error('[PDF Storage] Upload failed', {
        bucket: PROFILE_BUCKET,
        path,
        error: 'PDF não disponível para upload.',
        hasPdfBlob: Boolean(fileBlob),
        hasPdfFile: Boolean(dataUrl),
        hasSupabaseClient: Boolean(supabase),
      });
      return { success: false, error: 'PDF não disponível para upload.', publicUrl: null, path };
    }

    const { error } = await supabase.storage.from(PROFILE_BUCKET).upload(path, fileBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

    if (error) {
      console.error('[PDF Storage] Upload failed', {
        bucket: PROFILE_BUCKET,
        path,
        error,
        hasPdfBlob: Boolean(fileBlob),
        pdfBlobSize: fileBlob.size,
        pdfBlobType: fileBlob.type,
        hasPdfFile: Boolean(dataUrl),
        hasSupabaseClient: Boolean(supabase),
      });
      return { success: false, error: error.message, publicUrl: null, path };
    }

    const { data } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path);
    console.info('[PDF Storage] Upload success', {
      bucket: PROFILE_BUCKET,
      path,
      hasPdfBlob: Boolean(fileBlob),
      pdfBlobSize: fileBlob.size,
      pdfBlobType: fileBlob.type,
      hasSupabaseClient: Boolean(supabase),
      publicUrl: data.publicUrl,
    });
    return { success: true, path, publicUrl: data.publicUrl };
  },

  async createSignedPdfUrl(path: string, expiresIn = 60 * 60) {
    if (!supabase || !hasSupabaseConfig) {
      return { success: false, error: 'Supabase Storage não configurado.', signedUrl: null };
    }

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
    if (error) return { success: false, error: error.message, signedUrl: null };
    return { success: true, signedUrl: data.signedUrl };
  },

  async getPdfUrlForDelivery(delivery: {
    linkPdf?: string | null;
    link_pdf?: string | null;
    pdfDataUrl?: string | null;
    pdf_data_url?: string | null;
    pdfStoragePath?: string | null;
    pdf_storage_path?: string | null;
  }) {
    const path = delivery.pdfStoragePath || delivery.pdf_storage_path;
    if (path) {
      const signed = await this.createSignedPdfUrl(path);
      if (signed.signedUrl) return signed.signedUrl;
    }

    const dataUrl = delivery.pdfDataUrl || delivery.pdf_data_url;
    if (dataUrl) return dataUrl;

    const linkPdf = delivery.linkPdf || delivery.link_pdf;
    return linkPdf && !linkPdf.startsWith('local://') ? linkPdf : null;
  },

  async createPdfFileRecord({
    deliveryId,
    userId,
    fileName,
    path,
    signedUrl,
  }: {
    deliveryId: string;
    userId?: string | null;
    fileName?: string | null;
    path?: string | null;
    signedUrl?: string | null;
  }) {
    if (!supabase || !hasSupabaseConfig) return { success: false, error: 'Supabase não configurado.' };
    if (!isValidUuid(deliveryId)) {
      console.warn('[pdfStorageService] pdf_files ignorado porque delivery_id não é UUID real', { deliveryId, fileName, path });
      return { success: false, error: 'A entrega ainda não tem ID real do Supabase.' };
    }

    const { error } = await supabase.from('pdf_files').insert({
      delivery_id: deliveryId,
      user_id: userId || null,
      file_name: fileName,
      storage_path: path || null,
      signed_url: signedUrl || null,
      created_at: new Date().toISOString(),
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
