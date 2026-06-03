import { PageManifest } from './pdfManifest';

const t = {
  title: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 18, lineHeight: 1.25, letterSpacing: 0.5, color: "#112f4d", textAlign: "left" as const, textTransform: "uppercase" as const },
  body: { fontFamily: "Montserrat", fontWeight: 400, fontSize: 12.5, lineHeight: 1.6, color: "#262626", textAlign: "left" as const },
  heading: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 24, lineHeight: 1.2, color: "#112f4d", textAlign: "center" as const },
  subhead: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 14, lineHeight: 1.4, color: "#112f4d", textAlign: "left" as const },
};

export const manifest1: PageManifest[] = [
  { page: "cover", background: { type: "image", src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561480227_ae32b80c.jpg", size: "cover" }, placeholders: [
    { id: "p1", zIndex: 10, box: { xPct: 10, yPct: 45, wPct: 80, hPct: 5 }, typography: t.heading, content: "{{person1.name}}" },
    { id: "p2", zIndex: 10, box: { xPct: 10, yPct: 52, wPct: 80, hPct: 5 }, typography: t.heading, content: "{{person2.name}}" }
  ]},
  
  { page: "intro", background: { type: "image", src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561485985_12e84827.jpg", size: "cover" }, placeholders: [
    { id: "title", zIndex: 10, box: { xPct: 10, yPct: 20, wPct: 80, hPct: 5 }, typography: t.heading, content: "Análise de Compatibilidade" },
    { id: "score", zIndex: 10, box: { xPct: 10, yPct: 30, wPct: 80, hPct: 8 }, typography: {...t.heading, fontSize: 32}, content: "{{scores.overall}}% Compatibilidade" },
    { id: "type", zIndex: 10, box: { xPct: 10, yPct: 40, wPct: 80, hPct: 4 }, typography: t.subhead, content: "Relacionamento: {{relationshipType}}" }
  ]}
];
