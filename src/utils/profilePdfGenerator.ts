import jsPDF from 'jspdf';
import { SavedProfile } from './profileStorage';
import { formatDateBR } from './dateUtils';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const GOLD: [number, number, number] = [201, 169, 110];
const DARK: [number, number, number] = [11, 20, 38];
const INK: [number, number, number] = [35, 39, 47];
const MUTED: [number, number, number] = [95, 103, 117];

const typeLabels: Record<SavedProfile['type'], string> = {
  numerology: 'Mapa da Alma',
  compatibility: 'Compatibilidade',
  personalYear: 'Ano Pessoal',
};

const numberLabels: Record<string, string> = {
  soul: 'Numero da Alma',
  dom: 'Numero do Dom',
  destiny: 'Numero do Destino',
  talent: 'Numero do Talento',
  dream: 'Numero do Sonho',
};

const sanitizeFileName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'perfil';

const asText = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
};

const addText = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  options: { size?: number; color?: [number, number, number]; bold?: boolean; maxWidth?: number } = {}
) => {
  pdf.setFont('helvetica', options.bold ? 'bold' : 'normal');
  pdf.setFontSize(options.size || 11);
  pdf.setTextColor(...(options.color || INK));
  const lines = pdf.splitTextToSize(text, options.maxWidth || PAGE_WIDTH - MARGIN * 2);
  pdf.text(lines, x, y);
  return y + lines.length * ((options.size || 11) + 5);
};

const addPageChrome = (pdf: jsPDF) => {
  pdf.setFillColor(...DARK);
  pdf.rect(0, 0, PAGE_WIDTH, 98, 'F');
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(1.2);
  pdf.line(MARGIN, 118, PAGE_WIDTH - MARGIN, 118);
};

const ensureSpace = (pdf: jsPDF, y: number, needed = 48) => {
  if (y + needed < PAGE_HEIGHT - MARGIN) return y;
  pdf.addPage();
  addPageChrome(pdf);
  return 150;
};

const addKeyValue = (pdf: jsPDF, label: string, value: unknown, y: number) => {
  y = ensureSpace(pdf, y, 34);
  addText(pdf, label, MARGIN, y, { size: 9, color: MUTED, bold: true });
  return addText(pdf, asText(value), MARGIN + 150, y, { size: 10.5, maxWidth: PAGE_WIDTH - MARGIN * 2 - 150 }) + 4;
};

const collectResultRows = (profile: SavedProfile): Array<[string, unknown]> => {
  const rows: Array<[string, unknown]> = [];
  const results = profile.results || {};

  Object.entries(numberLabels).forEach(([key, label]) => {
    if (results[key] !== undefined) rows.push([label, results[key]]);
  });

  const personalYear = profile.data?.personalYear || results.personalYear;
  if (personalYear !== undefined) rows.push(['Ano Pessoal', typeof personalYear === 'object' ? personalYear.personalYear || personalYear.year : personalYear]);

  const lifeCycles = profile.data?.lifeCycles;
  if (lifeCycles) {
    rows.push(['Ciclo 1', lifeCycles.first?.value]);
    rows.push(['Ciclo 2', lifeCycles.second?.value]);
    rows.push(['Ciclo 3', lifeCycles.third?.value]);
  }

  const challenges = profile.data?.challenges;
  if (challenges) {
    rows.push(['Desafio 1', challenges.first?.value]);
    rows.push(['Desafio 2', challenges.second?.value]);
    rows.push(['Desafio Maior', challenges.major?.value]);
  }

  const presents = profile.data?.presents;
  if (Array.isArray(presents)) {
    rows.push(['Presentes', presents.join(', ')]);
  } else if (presents) {
    rows.push(['Presentes', Object.values(presents).map((item: any) => item?.value ?? item).join(', ')]);
  }

  if (rows.length === 0 && profile.data) {
    Object.entries(profile.data).forEach(([key, value]) => {
      if (['lifeCycles', 'challenges', 'presents'].includes(key)) return;
      rows.push([key, value]);
    });
  }

  return rows.filter(([, value]) => value !== undefined && value !== null && value !== '');
};

export const generateProfilePDF = async (profile: SavedProfile) => {
  if (!profile?.profileName || !profile?.name || !profile?.birthDate) {
    throw new Error('Este perfil nao tem nome, cliente ou data de nascimento suficientes para gerar PDF.');
  }

  const pdf = new jsPDF('p', 'pt', 'a4');
  addPageChrome(pdf);

  addText(pdf, 'CAROL GRABER', MARGIN, 48, { size: 15, color: GOLD, bold: true });
  addText(pdf, 'NUMEROLOGIA', MARGIN, 68, { size: 9, color: [248, 245, 239] });
  addText(pdf, 'Perfil Salvo', MARGIN, 162, { size: 30, color: INK, bold: true });
  addText(pdf, profile.profileName, MARGIN, 194, { size: 14, color: GOLD, bold: true });

  let y = 246;
  y = addKeyValue(pdf, 'Tipo', typeLabels[profile.type] || profile.type, y);
  y = addKeyValue(pdf, 'Nome', profile.name, y);
  y = addKeyValue(pdf, 'Nascimento', formatDateBR(profile.birthDate), y);
  if (profile.phone) y = addKeyValue(pdf, 'Telefone', profile.phone, y);
  if (profile.email) y = addKeyValue(pdf, 'Email', profile.email, y);
  y = addKeyValue(pdf, 'Salvo em', new Date(profile.timestamp).toLocaleString('pt-BR'), y);

  y = ensureSpace(pdf, y + 22, 80);
  y = addText(pdf, 'Resultados', MARGIN, y + 20, { size: 20, color: INK, bold: true }) + 8;

  const rows = collectResultRows(profile);
  if (rows.length === 0) {
    y = addText(pdf, 'Nenhum resultado numerologico foi salvo neste perfil.', MARGIN, y, { color: MUTED });
  } else {
    rows.forEach(([label, value]) => {
      y = addKeyValue(pdf, label, value, y);
    });
  }

  if (profile.notes) {
    y = ensureSpace(pdf, y + 18, 96);
    y = addText(pdf, 'Notas', MARGIN, y + 20, { size: 18, color: INK, bold: true }) + 4;
    y = addText(pdf, profile.notes, MARGIN, y, { size: 10.5, maxWidth: PAGE_WIDTH - MARGIN * 2 });
  }

  if (profile.tags?.length) {
    y = ensureSpace(pdf, y + 18, 48);
    addText(pdf, `Tags: ${profile.tags.join(', ')}`, MARGIN, y + 20, { size: 10, color: MUTED });
  }

  const fileName = `perfil-${sanitizeFileName(profile.profileName)}.pdf`;
  pdf.save(fileName);
  return { fileName };
};
