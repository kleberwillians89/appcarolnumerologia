import { PageManifest } from './pdfManifest';

const t = {
  title: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 18, lineHeight: 1.25, letterSpacing: 0.5, color: "#112f4d", textAlign: "left" as const, textTransform: "uppercase" as const },
  body: { fontFamily: "Montserrat", fontWeight: 400, fontSize: 12.5, lineHeight: 1.6, color: "#262626", textAlign: "left" as const },
  heading: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: "#112f4d", textAlign: "center" as const },
};

export const manifest2: PageManifest[] = [
  { page: "p1_cycles", background: { type: "image", src: "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760561487208_cd030663.jpg", size: "cover" }, placeholders: [
    { id: "name", zIndex: 10, box: { xPct: 10, yPct: 12, wPct: 80, hPct: 4 }, typography: t.heading, content: "{{person1.name}} - Ciclos de Vida" },
    { id: "c1t", zIndex: 10, box: { xPct: 7.5, yPct: 20, wPct: 36, hPct: 3 }, typography: t.title, content: "{{person1.cycles.first.title}}" },
    { id: "c1b", zIndex: 10, box: { xPct: 7.5, yPct: 24, wPct: 36, hPct: 18 }, typography: t.body, content: "{{person1.cycles.first.body}}" },
    { id: "c2t", zIndex: 10, box: { xPct: 7.5, yPct: 44, wPct: 36, hPct: 3 }, typography: t.title, content: "{{person1.cycles.second.title}}" },
    { id: "c2b", zIndex: 10, box: { xPct: 7.5, yPct: 48, wPct: 36, hPct: 18 }, typography: t.body, content: "{{person1.cycles.second.body}}" },
    { id: "c3t", zIndex: 10, box: { xPct: 7.5, yPct: 68, wPct: 36, hPct: 3 }, typography: t.title, content: "{{person1.cycles.third.title}}" },
    { id: "c3b", zIndex: 10, box: { xPct: 7.5, yPct: 72, wPct: 36, hPct: 15 }, typography: t.body, content: "{{person1.cycles.third.body}}" }
  ]}
];
