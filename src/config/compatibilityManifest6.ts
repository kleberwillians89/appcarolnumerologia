import { PageManifest } from './pdfManifest';

const t = {
  title: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: "#112f4d", textAlign: "left" as const, textTransform: "uppercase" as const },
  body: { fontFamily: "Montserrat", fontWeight: 400, fontSize: 12.5, lineHeight: 1.6, color: "#262626", textAlign: "left" as const },
  heading: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: "#112f4d", textAlign: "center" as const },
};

export const manifest6: PageManifest[] = [
  { page: "soul_compat", background: { type: "image", src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561485985_12e84827.jpg", size: "cover" }, placeholders: [
    { id: "title", zIndex: 10, box: { xPct: 10, yPct: 12, wPct: 80, hPct: 4 }, typography: t.heading, content: "Compatibilidade da Alma" },
    { id: "score", zIndex: 10, box: { xPct: 10, yPct: 20, wPct: 80, hPct: 4 }, typography: {...t.heading, fontSize: 28}, content: "{{scores.soul}}%" },
    { id: "body", zIndex: 10, box: { xPct: 10, yPct: 28, wPct: 80, hPct: 55 }, typography: t.body, content: "{{compatibility.soul}}" }
  ]},
  
  { page: "destiny_compat", background: { type: "image", src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561487208_cd030663.jpg", size: "cover" }, placeholders: [
    { id: "title", zIndex: 10, box: { xPct: 10, yPct: 12, wPct: 80, hPct: 4 }, typography: t.heading, content: "Compatibilidade do Destino" },
    { id: "score", zIndex: 10, box: { xPct: 10, yPct: 20, wPct: 80, hPct: 4 }, typography: {...t.heading, fontSize: 28}, content: "{{scores.destiny}}%" },
    { id: "body", zIndex: 10, box: { xPct: 10, yPct: 28, wPct: 80, hPct: 55 }, typography: t.body, content: "{{compatibility.destiny}}" }
  ]}
];
