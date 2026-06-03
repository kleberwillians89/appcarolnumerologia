import { PageManifest } from './pdfManifest';

const t = {
  title: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: "#112f4d", textAlign: "left" as const, textTransform: "uppercase" as const },
  body: { fontFamily: "Montserrat", fontWeight: 400, fontSize: 12.5, lineHeight: 1.6, color: "#262626", textAlign: "left" as const },
  heading: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: "#112f4d", textAlign: "center" as const },
};

export const manifest9: PageManifest[] = [
  { page: "growth", background: { type: "image", src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561485985_12e84827.jpg", size: "cover" }, placeholders: [
    { id: "title", zIndex: 10, box: { xPct: 10, yPct: 12, wPct: 80, hPct: 4 }, typography: t.heading, content: "Recomendações de Crescimento" },
    { id: "body", zIndex: 10, box: { xPct: 10, yPct: 20, wPct: 80, hPct: 65 }, typography: t.body, content: "{{growth}}" }
  ]},
  
  { page: "final", background: { type: "image", src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561487208_cd030663.jpg", size: "cover" }, placeholders: [
    { id: "title", zIndex: 10, box: { xPct: 10, yPct: 12, wPct: 80, hPct: 4 }, typography: t.heading, content: "Mensagem Final" },
    { id: "body", zIndex: 10, box: { xPct: 10, yPct: 20, wPct: 80, hPct: 50 }, typography: t.body, content: "{{finalMessage}}" },
    { id: "names", zIndex: 10, box: { xPct: 10, yPct: 75, wPct: 80, hPct: 5 }, typography: {...t.heading, fontSize: 18}, content: "{{person1.name}} & {{person2.name}}" }
  ]}
];
