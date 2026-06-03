import html2canvas from 'html2canvas';

export async function exportChartAsImage(
  chartRef: React.RefObject<HTMLDivElement>,
  filename: string
): Promise<void> {
  if (!chartRef.current) {
    throw new Error('Referência do gráfico não encontrada');
  }

  try {
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: '#1e293b',
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Erro ao exportar gráfico:', error);
    throw new Error('Falha ao exportar gráfico como imagem');
  }
}
