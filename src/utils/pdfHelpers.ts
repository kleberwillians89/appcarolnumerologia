// src/utils/pdfHelpers.ts
import jsPDF from 'jspdf';
import { Typography, Box, Placeholder } from '../config/pdfManifestsTypes';
import { pdfFixedTexts } from '../config/pdfTexts';

/* ===================== Utils ===================== */

export function formatMasterNumber(num: number): string {
  if (num === 11) return '11/2';
  if (num === 22) return '22/4';
  if (num === 33) return '33/6';
  return String(num);
}

export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}

export function boxToMm(box: Box | any, pageWidthMm: number, pageHeightMm: number) {
  // Aceita {x,y,w,h} em % ou {xPct,yPct,wPct,hPct} em %
  const xPct = 'x' in box ? box.x : box.xPct;
  const yPct = 'y' in box ? box.y : box.yPct;
  const wPct = 'w' in box ? box.w : box.wPct;
  const hPct = 'h' in box ? box.h : box.hPct;
  return {
    x: (xPct / 100) * pageWidthMm,
    y: (yPct / 100) * pageHeightMm,
    w: (wPct / 100) * pageWidthMm,
    h: (hPct / 100) * pageHeightMm,
  };
}

/* ===================== Imagens ===================== */

export function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failed'));
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(new Error(`Failed to load image: ${url} ${String(err)}`));

    const absolute = url.startsWith('http') ? url : (window?.location?.origin || '') + url;
    img.src = absolute;
  });
}

export async function addBackgroundImage(pdf: jsPDF, imgUrl: string) {
  const imgData = await loadImage(imgUrl);
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
}

/* ===================== Tipografia ===================== */

function normalizeTypography(typo: any) {
  // Caminho 1: tipografia “completa”
  if (typo?.fontFamily) {
    return {
      fontFamily: typo.fontFamily,
      fontWeight: typo.fontWeight ?? 400,
      fontSize: typo.fontSize ?? 12,
      lineHeight: typo.lineHeight ?? 1.4,
      color: typo.color ?? '#262626',
      textAlign: typo.textAlign ?? 'left',
      letterSpacing: typo.letterSpacing ?? 0,
      textTransform: typo.textTransform ?? undefined,
    };
  }
  // Caminho 2: forma “legada” (variant/textColorHex)
  const isTitle = typo?.variant === 'title';
  return {
    fontFamily: 'Montserrat',
    fontWeight: isTitle ? 700 : 400,
    fontSize: typo?.fontSize ?? (isTitle ? 18 : 12),
    lineHeight: 1.4,
    color: typo?.textColorHex ?? (isTitle ? '#112f4d' : '#262626'),
    textAlign: typo?.textAlign ?? 'left',
    letterSpacing: 0,
    textTransform: undefined,
  };
}

function setPdfFont(pdf: jsPDF, t: any) {
  try {
    pdf.setFont(t.fontFamily || 'Montserrat', (t.fontWeight >= 700 ? 'bold' : 'normal') as any);
  } catch {
    pdf.setFont('helvetica', (t.fontWeight >= 700 ? 'bold' : 'normal') as any);
  }
  pdf.setFontSize(t.fontSize);
  const [r, g, b] = hexToRgb(t.color || '#262626');
  pdf.setTextColor(r, g, b);
}

/* ===================== Placeholders ===================== */

export function replacePlaceholders(text: string, data: any): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const keys = key.trim().split('.');
    let value: any = data;
    for (const k of keys) value = value?.[k];
    if (value === undefined || value === null) return '';
    if (typeof value === 'number' && (value === 11 || value === 22 || value === 33)) {
      return formatMasterNumber(value);
    }
    return String(value);
  });
}

const renderedPlaceholders = new Set<string>();
export function resetRenderedPlaceholders() {
  renderedPlaceholders.clear();
}

export function renderPlaceholder(pdf: jsPDF, placeholder: Placeholder, data: any) {
  if (renderedPlaceholders.has(placeholder.id)) return;

  const enriched = { ...data, texts: pdfFixedTexts };
  const content = replacePlaceholders(placeholder.content, enriched);
  if (!content) return;

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const box = boxToMm(placeholder.box as any, pageW, pageH);

  const t = normalizeTypography(placeholder.typography);
  setPdfFont(pdf, t);

  const lines = pdf.splitTextToSize(content, box.w);
  const lineSpacing = (t.fontSize * (t.lineHeight ?? 1.4)) * 0.352778; // px->mm

  let y = box.y;
  const align = (t.textAlign as any) || 'left';

  for (const line of lines as string[]) {
    if (y + lineSpacing > box.y + box.h) break; // evita overflow
    const x =
      align === 'center' ? box.x + box.w / 2 :
      align === 'right'  ? box.x + box.w     :
                           box.x;
    pdf.text(line, x, y, { align });
    y += lineSpacing;
  }

  renderedPlaceholders.add(placeholder.id);
}
