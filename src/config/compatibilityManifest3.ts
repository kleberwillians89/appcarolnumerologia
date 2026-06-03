import { PageManifest } from './pdfManifest';

const t = {
  title: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: "#112f4d", textAlign: "left" as const, textTransform: "uppercase" as const },
  body: { fontFamily: "Montserrat", fontWeight: 400, fontSize: 12.5, lineHeight: 1.6, color: "#262626", textAlign: "left" as const },
  heading: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: "#112f4d", textAlign: "center" as const },
};

export const manifest3: PageManifest[] = [
  { page: "p1_challenges", background: { type: "image", src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561485985_12e84827.jpg", size: "cover" }, placeholders: [
    { id: "name", zIndex: 10, box: { xPct: 10, yPct: 12, wPct: 80, hPct: 4 }, typography: t.heading, content: "{{person1.name}} - Desafios" },
    { id: "ch1t", zIndex: 10, box: { xPct: 10, yPct: 22, wPct: 80, hPct: 3 }, typography: t.title, content: "Desafio Principal" },
    { id: "ch1b", zIndex: 10, box: { xPct: 10, yPct: 26, wPct: 80, hPct: 20 }, typography: t.body, content: "{{person1.challenges.main}}" },
    { id: "ch2t", zIndex: 10, box: { xPct: 10, yPct: 50, wPct: 80, hPct: 3 }, typography: t.title, content: "Desafios Secundários" },
    { id: "ch2b", zIndex: 10, box: { xPct: 10, yPct: 54, wPct: 80, hPct: 30 }, typography: t.body, content: "{{person1.challenges.secondary}}" }
  ]},
  
  { page: "p1_year", background: { type: "image", src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561487208_cd030663.jpg", size: "cover" }, placeholders: [
    { id: "name", zIndex: 10, box: { xPct: 10, yPct: 12, wPct: 80, hPct: 4 }, typography: t.heading, content: "{{person1.name}} - Ano Pessoal {{person1.personalYear.year}}" },
    { id: "title", zIndex: 10, box: { xPct: 10, yPct: 22, wPct: 80, hPct: 3 }, typography: t.title, content: "{{person1.personalYear.title}}" },
    { id: "body", zIndex: 10, box: { xPct: 10, yPct: 26, wPct: 80, hPct: 60 }, typography: t.body, content: "{{person1.personalYear.body}}" }
  ]}
];
