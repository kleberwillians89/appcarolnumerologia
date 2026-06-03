import { PageManifest } from './pdfManifest';

const t = {
  heading: { 
    fontFamily: "Montserrat", 
    fontWeight: 700, 
    fontSize: 20, 
    lineHeight: 1.2, 
    color: "#112f4d", 
    textAlign: "center" as const 
  },
  body: { 
    fontFamily: "Montserrat", 
    fontWeight: 400, 
    fontSize: 12, 
    lineHeight: 1.5, 
    color: "#262626", 
    textAlign: "center" as const 
  }
};

export const manifest10: PageManifest[] = [
  { 
    page: "p_radar_chart", 
    background: { 
      type: "image", 
      src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561487208_cd030663.jpg", 
      size: "cover" 
    }, 
    placeholders: [
      { 
        id: "chart_title", 
        zIndex: 10, 
        box: { xPct: 10, yPct: 8, wPct: 80, hPct: 5 }, 
        typography: t.heading, 
        content: "Análise Visual de Compatibilidade" 
      },
      { 
        id: "chart_description", 
        zIndex: 10, 
        box: { xPct: 10, yPct: 14, wPct: 80, hPct: 4 }, 
        typography: t.body, 
        content: "Visualização comparativa das 4 dimensões principais de compatibilidade" 
      },
      { 
        id: "radar_chart", 
        zIndex: 10, 
        box: { xPct: 10, yPct: 20, wPct: 80, hPct: 70 }, 
        type: "image" as const,
        content: "{{radarChartImage}}" 
      }
    ]
  }
];
