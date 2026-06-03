import jsPDF from 'jspdf';
import { COLORS, MARGIN, PAGE_HEIGHT, PAGE_WIDTH, addText } from './mapaDaAlmaPdfHelpers';

/** Página 1 - Capa premium Carol Graber */
export const renderCapaPage = async (
  pdf: jsPDF,
  nome: string,
  dataNascimento: string,
  dataEmissao: string
) => {
  pdf.setFillColor(...COLORS.darkBg);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  pdf.setFillColor(29, 34, 42);
  pdf.circle(PAGE_WIDTH - 70, 92, 180, 'F');
  pdf.setFillColor(22, 26, 33);
  pdf.circle(56, PAGE_HEIGHT - 60, 190, 'F');

  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(1.2);
  pdf.rect(MARGIN, MARGIN, PAGE_WIDTH - 2 * MARGIN, PAGE_HEIGHT - 2 * MARGIN, 'S');

  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(2.2);
  pdf.line(MARGIN + 34, 128, MARGIN + 104, 128);

  addText(pdf, 'CAROL GRABER', MARGIN + 34, 156, {
    size: 16,
    color: COLORS.gold,
    font: 'helvetica',
    style: 'bold',
  });
  addText(pdf, 'NUMEROLOGIA', MARGIN + 34, 176, {
    size: 9,
    color: COLORS.softGold,
    font: 'helvetica',
    style: 'normal',
  });

  addText(pdf, 'Mapa da Alma', MARGIN + 34, 356, {
    size: 46,
    color: COLORS.white,
    font: 'helvetica',
    style: 'bold',
  });
  addText(pdf, 'Leitura numerologica premium', MARGIN + 36, 386, {
    size: 13,
    color: COLORS.softGold,
    font: 'helvetica',
    style: 'normal',
  });

  pdf.setFillColor(255, 255, 255);
  pdf.setGState(new pdf.GState({ opacity: 0.08 }));
  pdf.roundedRect(MARGIN + 34, 440, PAGE_WIDTH - (MARGIN + 34) * 2, 146, 8, 8, 'F');
  pdf.setGState(new pdf.GState({ opacity: 1 }));

  addText(pdf, 'Cliente', MARGIN + 58, 478, {
    size: 10,
    color: COLORS.softGold,
    font: 'helvetica',
    style: 'bold',
  });
  addText(pdf, nome, MARGIN + 58, 506, {
    size: 22,
    color: COLORS.white,
    font: 'helvetica',
    style: 'bold',
    maxWidth: PAGE_WIDTH - 2 * MARGIN - 116,
  });

  addText(pdf, `Nascimento: ${dataNascimento}`, MARGIN + 58, 548, {
    size: 11,
    color: COLORS.softGold,
    font: 'helvetica',
    style: 'normal',
  });
  addText(pdf, `Emissao: ${dataEmissao}`, MARGIN + 58, 568, {
    size: 11,
    color: COLORS.softGold,
    font: 'helvetica',
    style: 'normal',
  });

  addText(pdf, 'Um retrato numerologico para orientar ciclos, escolhas e potenciais.', MARGIN + 34, PAGE_HEIGHT - 106, {
    size: 10,
    color: COLORS.softGold,
    font: 'helvetica',
    style: 'normal',
    maxWidth: PAGE_WIDTH - 2 * MARGIN - 68,
  });
};
