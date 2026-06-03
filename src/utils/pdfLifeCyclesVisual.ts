import jsPDF from 'jspdf';

interface LifeCycle {
  label: string;
  range: [number, number];
  value: number;
}

interface LifeCyclesData {
  first: LifeCycle;
  second: LifeCycle;
  third: LifeCycle;
}

export const addLifeCyclesTimeline = (pdf: jsPDF, cycles: LifeCyclesData, startY: number = 100) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const timelineWidth = pageWidth - (margin * 2);
  const barHeight = 30;
  const spacing = 12;
  
  // Cores para cada ciclo (RGB)
  const colors = {
    formativo: { r: 59, g: 130, b: 246, light: { r: 191, g: 219, b: 254 } },    // Azul
    produtivo: { r: 34, g: 197, b: 94, light: { r: 187, g: 247, b: 208 } },     // Verde
    colheita: { r: 168, g: 85, b: 247, light: { r: 233, g: 213, b: 255 } }      // Roxo
  };
  
  let yPos = startY;
  
  // Título da seção
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text('JORNADA DOS CICLOS DE VIDA', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;
  
  // Subtítulo
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);
  pdf.text('Visualização dos três grandes ciclos que moldam sua trajetória', pageWidth / 2, yPos, { align: 'center' });
  yPos += 18;
  
  // 1º Ciclo - Formativo (0-28 anos)
  renderCycleBar(pdf, {
    x: margin,
    y: yPos,
    width: timelineWidth,
    height: barHeight,
    color: colors.formativo,
    label: '1º CICLO - FORMATIVO',
    subtitle: 'Fase de Aprendizado e Desenvolvimento',
    range: '0-28 anos',
    value: cycles.first.value,
    milestones: [
      { age: '0', label: 'Nascimento' },
      { age: '7', label: 'Infância' },
      { age: '14', label: 'Adolescência' },
      { age: '21', label: 'Juventude' },
      { age: '28', label: 'Maturidade Inicial' }
    ]
  });
  
  yPos += barHeight + spacing + 15;
  
  // 2º Ciclo - Produtivo (29-56 anos)
  renderCycleBar(pdf, {
    x: margin,
    y: yPos,
    width: timelineWidth,
    height: barHeight,
    color: colors.produtivo,
    label: '2º CICLO - PRODUTIVO',
    subtitle: 'Fase de Realização e Construção',
    range: '29-56 anos',
    value: cycles.second.value,
    milestones: [
      { age: '29', label: 'Início' },
      { age: '35', label: 'Consolidação' },
      { age: '42', label: 'Auge' },
      { age: '49', label: 'Maestria' },
      { age: '56', label: 'Transição' }
    ]
  });
  
  yPos += barHeight + spacing + 15;
  
  // 3º Ciclo - Colheita (57+ anos)
  renderCycleBar(pdf, {
    x: margin,
    y: yPos,
    width: timelineWidth,
    height: barHeight,
    color: colors.colheita,
    label: '3º CICLO - COLHEITA',
    subtitle: 'Fase de Sabedoria e Legado',
    range: '57+ anos',
    value: cycles.third.value,
    milestones: [
      { age: '57', label: 'Sabedoria' },
      { age: '65', label: 'Plenitude' },
      { age: '75', label: 'Legado' },
      { age: '85', label: 'Transcendência' },
      { age: '∞', label: 'Eternidade' }
    ]
  });
};

const renderCycleBar = (pdf: jsPDF, config: any) => {
  const { x, y, width, height, color, label, subtitle, range, value, milestones } = config;
  
  // Gradiente simulado com retângulos sobrepostos
  pdf.setFillColor(color.light.r, color.light.g, color.light.b);
  pdf.roundedRect(x, y, width, height, 3, 3, 'F');
  
  pdf.setFillColor(color.r, color.g, color.b);
  pdf.roundedRect(x, y, width * 0.7, height, 3, 3, 'F');
  
  // Borda
  pdf.setDrawColor(color.r - 20, color.g - 20, color.b - 20);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, width, height, 3, 3, 'S');
  
  // Label do ciclo
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(label, x + 10, y + 10);
  
  // Subtítulo
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(subtitle, x + 10, y + 16);
  
  // Range de idades
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(range, x + 10, y + 23);
  
  // Número do ciclo (caixa destacada)
  const boxX = x + width - 35;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(boxX, y + 7, 28, 16, 2, 2, 'F');
  pdf.setTextColor(color.r, color.g, color.b);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Nº ${value}`, boxX + 14, y + 18, { align: 'center' });
  
  // Marcos (milestones) abaixo da barra
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  milestones.forEach((milestone: any, idx: number) => {
    const mX = x + (width / (milestones.length - 1)) * idx;
    pdf.setFillColor(color.r, color.g, color.b);
    pdf.circle(mX, y + height + 3, 1.5, 'F');
    pdf.text(milestone.age, mX, y + height + 8, { align: 'center' });
    pdf.setFontSize(6);
    pdf.text(milestone.label, mX, y + height + 12, { align: 'center' });
    pdf.setFontSize(7);
  });
};
