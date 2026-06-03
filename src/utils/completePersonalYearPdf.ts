import jsPDF from 'jspdf';
import { personalYearInterpretations } from '../texts/personalYear';
import { getMonthlyGuidance } from './monthlyGuidance';
import {
  COLORS,
  CONTENT_WIDTH,
  MARGIN,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  addBox,
  addPremiumInteriorChrome,
  addText,
  createFriendlyFileName,
  formatDatePtBr,
  setPremiumPdfMeta,
} from './mapaDaAlmaPdfHelpers';

const months = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const getOpp = (y: number) => ({1: ['Iniciar projetos', 'Desenvolver liderança', 'Afirmar independência', 'Criar oportunidades'], 2: ['Fortalecer parcerias', 'Desenvolver intuição', 'Cultivar relacionamentos', 'Praticar diplomacia'], 3: ['Expandir comunicação', 'Expressar criatividade', 'Crescimento profissional', 'Aumentar renda'], 4: ['Construir bases', 'Organizar finanças', 'Estabelecer rotinas', 'Consolidar projetos'], 5: ['Explorar mudanças', 'Viajar', 'Libertar-se do passado', 'Experimentar novo'], 6: ['Harmonizar família', 'Cuidar do lar', 'Fortalecer vínculos', 'Resolver pendências'], 7: ['Aprofundar estudos', 'Espiritualidade', 'Autoconhecimento', 'Refinar intuição'], 8: ['Colher resultados', 'Prosperar', 'Questões legais', 'Reconhecimento'], 9: ['Encerrar ciclos', 'Desapego', 'Ajudar outros', 'Preparar novo começo']}[y] || []);

const getThemes = (y: number) => ({1: ['Novos começos', 'Independência', 'Coragem', 'Iniciativa'], 2: ['Parcerias', 'Paciência', 'Cooperação', 'Sensibilidade'], 3: ['Comunicação', 'Criatividade', 'Expansão', 'Alegria'], 4: ['Trabalho', 'Disciplina', 'Estrutura', 'Estabilidade'], 5: ['Mudança', 'Liberdade', 'Aventura', 'Adaptação'], 6: ['Família', 'Responsabilidade', 'Harmonia', 'Cuidado'], 7: ['Introspecção', 'Sabedoria', 'Espiritualidade', 'Análise'], 8: ['Prosperidade', 'Poder', 'Justiça', 'Realização'], 9: ['Finalização', 'Compaixão', 'Transcendência', 'Desapego']}[y] || []);

const getChal = (y: number) => ({1: ['Evitar egoísmo', 'Não agir por impulso', 'Aceitar ajuda'], 2: ['Lidar com sensibilidade', 'Evitar dependência', 'Ter paciência'], 3: ['Manter foco', 'Controlar ansiedade', 'Evitar dispersão'], 4: ['Aceitar trabalho', 'Evitar rigidez', 'Manter equilíbrio'], 5: ['Lidar com instabilidade', 'Controlar ansiedade', 'Evitar excessos'], 6: ['Não sobrecarregar', 'Equilibrar dar/receber', 'Evitar perfeccionismo'], 7: ['Evitar isolamento', 'Confiar intuição', 'Aceitar silêncio'], 8: ['Manter ética', 'Equilibrar material/espiritual', 'Evitar autoritarismo'], 9: ['Aceitar finalizações', 'Praticar desapego', 'Deixar passado ir']}[y] || []);

interface PersonalYearPdfOptions {
  clientName?: string;
  birthDate?: string;
  previewMode?: boolean;
}

const addInteriorPage = (pdf: jsPDF, meta: { clientName: string; birthDate: string; issueDate: string; productName: string }) => {
  pdf.addPage();
  setPremiumPdfMeta(meta);
  addPremiumInteriorChrome(pdf);
};

const renderCover = (
  pdf: jsPDF,
  py: number,
  title: string,
  meta: { clientName: string; birthDate: string; issueDate: string; productName: string }
) => {
  pdf.setFillColor(...COLORS.darkBg);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  pdf.setFillColor(29, 34, 42);
  pdf.circle(PAGE_WIDTH - 80, 90, 180, 'F');
  pdf.setFillColor(22, 26, 33);
  pdf.circle(60, PAGE_HEIGHT - 70, 190, 'F');

  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(1.2);
  pdf.rect(MARGIN, MARGIN, PAGE_WIDTH - 2 * MARGIN, PAGE_HEIGHT - 2 * MARGIN, 'S');

  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(2.2);
  pdf.line(MARGIN + 34, 128, MARGIN + 104, 128);

  addText(pdf, 'CAROL GRABER', MARGIN + 34, 156, { size: 16, color: COLORS.gold, font: 'helvetica', style: 'bold' });
  addText(pdf, 'NUMEROLOGIA', MARGIN + 34, 176, { size: 9, color: COLORS.softGold, font: 'helvetica', style: 'normal' });

  addText(pdf, 'Ano Pessoal', MARGIN + 34, 332, { size: 44, color: COLORS.white, font: 'helvetica', style: 'bold' });
  addText(pdf, title, MARGIN + 36, 362, { size: 13, color: COLORS.softGold, font: 'helvetica', style: 'normal', maxWidth: PAGE_WIDTH - 2 * MARGIN - 68 });

  pdf.setFillColor(...COLORS.gold);
  pdf.circle(PAGE_WIDTH / 2, 482, 54, 'F');
  addText(pdf, String(py), PAGE_WIDTH / 2, 504, { size: 58, color: COLORS.white, font: 'helvetica', style: 'bold', align: 'center' });

  pdf.setFillColor(255, 255, 255);
  pdf.setGState(new pdf.GState({ opacity: 0.08 }));
  pdf.roundedRect(MARGIN + 34, 600, PAGE_WIDTH - (MARGIN + 34) * 2, 96, 8, 8, 'F');
  pdf.setGState(new pdf.GState({ opacity: 1 }));

  addText(pdf, meta.clientName, MARGIN + 58, 638, { size: 18, color: COLORS.white, font: 'helvetica', style: 'bold', maxWidth: PAGE_WIDTH - 2 * MARGIN - 116 });
  addText(pdf, `Nascimento: ${meta.birthDate}`, MARGIN + 58, 662, { size: 10.5, color: COLORS.softGold });
  addText(pdf, `Emissao: ${meta.issueDate}`, MARGIN + 58, 682, { size: 10.5, color: COLORS.softGold });
};

const renderSectionTitle = (pdf: jsPDF, title: string, subtitle: string, y: number) => {
  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(2);
  pdf.line(MARGIN, y - 24, MARGIN + 54, y - 24);
  addText(pdf, title, PAGE_WIDTH / 2, y, { size: 24, color: COLORS.charcoal, font: 'helvetica', style: 'bold', align: 'center' });
  addText(pdf, subtitle, PAGE_WIDTH / 2, y + 18, { size: 10.5, color: COLORS.muted, align: 'center' });
};

const renderTimeline = (pdf: jsPDF, py: number, y: number) => {
  const step = CONTENT_WIDTH / 10;
  pdf.setDrawColor(...COLORS.line);
  pdf.setLineWidth(2);
  pdf.line(MARGIN + step / 2, y, MARGIN + CONTENT_WIDTH - step / 2, y);

  for (let i = 1; i <= 9; i++) {
    const x = MARGIN + step / 2 + (i - 1) * step;
    const active = i === py;
    pdf.setFillColor(...(active ? COLORS.gold : COLORS.white));
    pdf.setDrawColor(...(active ? COLORS.gold : COLORS.line));
    pdf.circle(x, y, active ? 10 : 8, 'FD');
    addText(pdf, String(i), x, y + 3.5, { size: 9.5, color: active ? COLORS.white : COLORS.charcoal, font: 'helvetica', style: 'bold', align: 'center' });
  }
};

const renderListCard = (pdf: jsPDF, title: string, items: string[], x: number, y: number, width: number) => {
  addBox(pdf, x, y, width, 154, { fill: COLORS.panel, border: COLORS.line, radius: 8 });
  addText(pdf, title, x + 16, y + 28, { size: 13, color: COLORS.charcoal, font: 'helvetica', style: 'bold' });

  let itemY = y + 52;
  for (const item of items) {
    pdf.setFillColor(...COLORS.gold);
    pdf.circle(x + 19, itemY - 4, 3, 'F');
    addText(pdf, item, x + 30, itemY, { size: 9.5, color: COLORS.ink, maxWidth: width - 44 });
    itemY += 22;
  }
};

const addTextPages = (
  pdf: jsPDF,
  text: string,
  startY: number,
  meta: { clientName: string; birthDate: string; issueDate: string; productName: string }
) => {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11.2);
  const lines = pdf.splitTextToSize(text, CONTENT_WIDTH - 24);
  const lineHeight = 16;
  let y = startY;

  for (const line of lines) {
    if (y > PAGE_HEIGHT - 94) {
      addInteriorPage(pdf, meta);
      y = 126;
    }
    pdf.setTextColor(...COLORS.ink);
    pdf.text(line, MARGIN + 12, y);
    y += lineHeight;
  }
};

export const generateCompletePDF = async (
  py: number,
  bm: number,
  d: string,
  m: string,
  options: PersonalYearPdfOptions = {}
) => {
  const pdf = new jsPDF('p', 'pt', 'a4');
  const interp = personalYearInterpretations[py];
  const currentYear = new Date().getFullYear();
  const issueDate = formatDatePtBr();
  const fallbackBirthDate = d && m ? `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}` : 'Nao informado';
  const meta = {
    clientName: options.clientName || 'Cliente',
    birthDate: options.birthDate || fallbackBirthDate,
    issueDate,
    productName: `Ano Pessoal ${currentYear}`,
  };

  setPremiumPdfMeta(meta);
  renderCover(pdf, py, interp?.title || `Ano Pessoal ${py}`, meta);

  addInteriorPage(pdf, meta);
  renderSectionTitle(pdf, 'Leitura do Ano Pessoal', `Ano Pessoal ${py} - ${currentYear}`, 130);
  renderTimeline(pdf, py, 214);
  addText(pdf, interp?.title || '', MARGIN + 12, 270, { size: 17, color: COLORS.charcoal, font: 'helvetica', style: 'bold', maxWidth: CONTENT_WIDTH - 24 });
  addTextPages(pdf, interp?.description || '', 302, meta);

  addInteriorPage(pdf, meta);
  renderSectionTitle(pdf, 'Direcionamentos do Ciclo', 'Oportunidades, temas principais e desafios', 130);
  const cardWidth = (CONTENT_WIDTH - 28) / 3;
  renderListCard(pdf, 'Oportunidades', getOpp(py), MARGIN, 210, cardWidth);
  renderListCard(pdf, 'Temas Principais', getThemes(py), MARGIN + cardWidth + 14, 210, cardWidth);
  renderListCard(pdf, 'Desafios', getChal(py), MARGIN + (cardWidth + 14) * 2, 210, cardWidth);

  addInteriorPage(pdf, meta);
  renderSectionTitle(pdf, `Previsao Mensal - Ano Pessoal ${py}`, 'Ciclo organizado a partir do mes de aniversario', 130);

  const currentMonth = new Date().getMonth() + 1;
  const startYear = currentMonth >= bm ? currentYear : currentYear - 1;
  const cardW = (CONTENT_WIDTH - 28) / 3;
  const cardH = 118;
  let y = 198;

  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 6 === 0) {
      addInteriorPage(pdf, meta);
      renderSectionTitle(pdf, `Previsao Mensal - Ano Pessoal ${py}`, 'Continuidade do ciclo pessoal', 130);
      y = 198;
    }

    const row = Math.floor((i % 6) / 3);
    const col = i % 3;
    const x = MARGIN + col * (cardW + 14);
    const currentY = y + row * (cardH + 18);
    const monthIndex = ((bm - 1 + i) % 12);
    const yearOffset = Math.floor((bm - 1 + i) / 12);
    const displayYear = startYear + yearOffset;
    const monthNum = monthIndex + 1;
    const guidance = getMonthlyGuidance(monthNum, py);
    const guidanceLines = pdf.splitTextToSize(guidance, cardW - 24);

    addBox(pdf, x, currentY, cardW, cardH, { fill: COLORS.panel, border: COLORS.line, radius: 8 });
    addText(pdf, `${months[monthIndex]} ${displayYear}`, x + 12, currentY + 26, { size: 11.5, color: COLORS.charcoal, font: 'helvetica', style: 'bold' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.2);
    pdf.setTextColor(...COLORS.ink);
    pdf.text(guidanceLines, x + 12, currentY + 48);
  }

  const fileName = createFriendlyFileName(meta.clientName, `Ano Pessoal ${currentYear}`);
  if (options.previewMode) {
    return { pdf, fileName };
  }

  pdf.save(fileName);
  return { pdf, fileName };
};
