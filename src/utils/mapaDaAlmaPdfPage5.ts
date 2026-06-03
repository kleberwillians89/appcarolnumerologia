import jsPDF from 'jspdf';
import { COLORS, CONTENT_WIDTH, MARGIN, PAGE_WIDTH, addBackgroundImage, addBox, addText } from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';

/** Página 5 - Jornada da Vida */
export const renderJornadaPage = async (pdf: jsPDF) => {
  await addBackgroundImage(pdf, PDF_IMG.BG);

  addText(pdf, 'Jornada da Vida', PAGE_WIDTH / 2, 144, {
    size: 26,
    color: COLORS.charcoal,
    font: 'helvetica',
    style: 'bold',
    align: 'center',
  });

  addText(pdf, 'Uma leitura dos ciclos que estruturam sua caminhada', PAGE_WIDTH / 2, 166, {
    size: 11,
    color: COLORS.muted,
    font: 'helvetica',
    style: 'normal',
    align: 'center',
  });

  addBox(pdf, MARGIN, 218, CONTENT_WIDTH, 256, {
    fill: COLORS.panel,
    border: COLORS.line,
    radius: 10,
  });

  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(2);
  pdf.line(MARGIN + 24, 252, MARGIN + 78, 252);

  addText(pdf, 'O que esta etapa revela', MARGIN + 24, 288, {
    size: 18,
    color: COLORS.charcoal,
    font: 'helvetica',
    style: 'bold',
  });

  const body =
    'A Jornada da Vida organiza os grandes movimentos do mapa em fases, desafios e presentes. Ela mostra onde a vida pede amadurecimento, quais ciclos tendem a marcar viradas importantes e quais dons se tornam mais disponiveis em cada periodo.';

  addText(pdf, body, MARGIN + 24, 322, {
    size: 11.5,
    color: COLORS.ink,
    font: 'helvetica',
    style: 'normal',
    maxWidth: CONTENT_WIDTH - 48,
  });

  const items = [
    'Ciclos de Vida: as fases principais do desenvolvimento.',
    'Desafios Ciclicos: aprendizados que pedem consciencia e escolha.',
    'Presentes da Vida: potenciais que se abrem ao longo da trajetoria.',
  ];

  let y = 414;
  for (const item of items) {
    pdf.setFillColor(...COLORS.gold);
    pdf.circle(MARGIN + 30, y - 4, 3.5, 'F');
    addText(pdf, item, MARGIN + 44, y, {
      size: 10.8,
      color: COLORS.ink,
      font: 'helvetica',
      style: 'normal',
      maxWidth: CONTENT_WIDTH - 68,
    });
    y += 26;
  }
};
