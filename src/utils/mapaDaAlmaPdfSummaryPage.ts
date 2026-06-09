import jsPDF from 'jspdf';
import { MapaDaAlmaInput } from './mapaDaAlmaPdfTypes';
import {
  COLORS,
  CONTENT_WIDTH,
  MARGIN,
  PAGE_WIDTH,
  addBackgroundImage,
  addBox,
  addText,
} from './mapaDaAlmaPdfHelpers';
import { PDF_IMG } from './pdfImageUrls';

interface SummaryItem {
  label: string;
  value: string;
  detail?: string;
}

const findNumero = (data: MapaDaAlmaInput, label: string) => {
  return data.numeros.find((numero) => numero.titulo.toLowerCase().includes(label.toLowerCase()))?.numero || '-';
};

const drawSummaryCard = (
  pdf: jsPDF,
  title: string,
  items: SummaryItem[],
  x: number,
  y: number,
  width: number,
  columns: number
) => {
  const rowHeight = 42;
  const headerHeight = 44;
  const rows = Math.ceil(items.length / columns);
  const height = headerHeight + rows * rowHeight + 18;
  const colWidth = width / columns;

  addBox(pdf, x, y, width, height, {
    fill: COLORS.white,
    border: COLORS.softGold,
    radius: 10,
  });

  pdf.setFillColor(...COLORS.softGold);
  pdf.roundedRect(x, y, width, headerHeight, 10, 10, 'F');

  addText(pdf, title, x + 18, y + 27, {
    size: 13,
    color: COLORS.charcoal,
    font: 'helvetica',
    style: 'bold',
  });

  items.forEach((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const cellX = x + col * colWidth;
    const cellY = y + headerHeight + row * rowHeight;

    if (col > 0) {
      pdf.setDrawColor(...COLORS.line);
      pdf.setLineWidth(0.5);
      pdf.line(cellX, cellY + 8, cellX, cellY + rowHeight - 8);
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(item.label, cellX + 14, cellY + 16);

    pdf.setFillColor(...COLORS.gold);
    pdf.circle(cellX + 22, cellY + 30, 9, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...COLORS.white);
    pdf.text(item.value, cellX + 22, cellY + 34, { align: 'center' });

    if (item.detail) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...COLORS.muted);
      pdf.text(item.detail, cellX + 38, cellY + 33);
    }
  });

  return y + height;
};

export const renderMapaSummaryPage = async (pdf: jsPDF, data: MapaDaAlmaInput) => {
  await addBackgroundImage(pdf, PDF_IMG.BG);

  addText(pdf, 'Resumo do Mapa Numerológico', PAGE_WIDTH / 2, 128, {
    size: 24,
    color: COLORS.charcoal,
    font: 'helvetica',
    style: 'bold',
    align: 'center',
  });

  addText(
    pdf,
    'Uma visão geral dos principais números que estruturam sua leitura.',
    PAGE_WIDTH / 2,
    150,
    {
      size: 10.5,
      color: COLORS.muted,
      font: 'helvetica',
      align: 'center',
    }
  );

  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(2);
  pdf.line(MARGIN + 210, 170, PAGE_WIDTH - MARGIN - 210, 170);

  const personalityItems: SummaryItem[] = [
    { label: 'Alma', value: findNumero(data, 'Alma') },
    { label: 'Destino', value: findNumero(data, 'Destino') },
    { label: 'Sonho', value: findNumero(data, 'Sonho') },
    { label: 'Talento', value: findNumero(data, 'Talento') },
    { label: 'Dom', value: findNumero(data, 'Dom') },
    { label: 'Desafio Maior', value: findNumero(data, 'Desafio Maior') },
  ];

  const journeyItems: SummaryItem[] = [
    { label: '1º Ciclo', value: data.ciclos[0]?.numero || '-', detail: data.ciclos[0]?.faixa },
    { label: '2º Ciclo', value: data.ciclos[1]?.numero || '-', detail: data.ciclos[1]?.faixa },
    { label: '3º Ciclo', value: data.ciclos[2]?.numero || '-', detail: data.ciclos[2]?.faixa },
    { label: '1º Desafio', value: data.desafios.des1.numero, detail: data.desafios.des1.faixa },
    { label: '2º Desafio', value: data.desafios.des2.numero, detail: data.desafios.des2.faixa },
    { label: 'Desafio Maior', value: data.desafios.desafioMaior.numero, detail: 'Vida toda' },
    { label: '1º Presente', value: data.presentes.p1.numero, detail: data.presentes.p1.faixa },
    { label: '2º Presente', value: data.presentes.p2.numero, detail: data.presentes.p2.faixa },
    { label: '3º Presente', value: data.presentes.p3.numero, detail: data.presentes.p3.faixa },
    { label: '4º Presente', value: data.presentes.p4.numero, detail: data.presentes.p4.faixa },
  ];

  let y = 196;
  y = drawSummaryCard(pdf, 'Personalidade', personalityItems, MARGIN, y, CONTENT_WIDTH, 3) + 18;
  drawSummaryCard(pdf, 'Jornada da Vida', journeyItems, MARGIN, y, CONTENT_WIDTH, 2);

  addText(
    pdf,
    'Este resumo funciona como um mapa de navegação. As páginas seguintes aprofundam cada número com interpretação e orientação.',
    MARGIN,
    758,
    {
      size: 9.5,
      color: COLORS.muted,
      maxWidth: CONTENT_WIDTH,
    }
  );
};
