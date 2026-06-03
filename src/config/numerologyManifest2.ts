import { PageManifest } from './pdfManifest';

const t = {
  body: { fontFamily: "Montserrat", fontWeight: 400, fontSize: 11, lineHeight: 1.4, color: "#262626", textAlign: "left" as const },
  heading: { fontFamily: "Montserrat", fontWeight: 600, fontSize: 20, lineHeight: 1.4, color: "#112F4D", textAlign: "center" as const },
  number: { fontFamily: "Montserrat", fontWeight: 600, fontSize: 16, lineHeight: 1.4, color: "#112F4D", textAlign: "left" as const },
};

const bgImg = "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760570280071_db2ec386.png";

export const numerologyManifest2: PageManifest[] = [
  {
    page: "talent",
    background: { type: "image", src: bgImg, size: "cover" },
    placeholders: [
      { id: "title", zIndex: 10, box: { xPct: 10, yPct: 15, wPct: 80, hPct: 5 }, typography: t.heading, content: "Número do Talento" },
      { id: "number", zIndex: 10, box: { xPct: 10, yPct: 22, wPct: 80, hPct: 4 }, typography: t.number, content: "{{person.numbers.talent}}" },
      { id: "description", zIndex: 10, box: { xPct: 10, yPct: 30, wPct: 80, hPct: 60 }, typography: t.body, content: "{{person.interpretations.talent.description}}" }
    ]
  },
  {
    page: "dream",
    background: { type: "image", src: bgImg, size: "cover" },
    placeholders: [
      { id: "title", zIndex: 10, box: { xPct: 10, yPct: 15, wPct: 80, hPct: 5 }, typography: t.heading, content: "Número do Sonho" },
      { id: "number", zIndex: 10, box: { xPct: 10, yPct: 22, wPct: 80, hPct: 4 }, typography: t.number, content: "{{person.numbers.dream}}" },
      { id: "description", zIndex: 10, box: { xPct: 10, yPct: 30, wPct: 80, hPct: 60 }, typography: t.body, content: "{{person.interpretations.dream.description}}" }
    ]
  },
  {
    page: "cycles",
    background: { type: "image", src: bgImg, size: "cover" },
    placeholders: [
      { id: "title", zIndex: 10, box: { xPct: 10, yPct: 15, wPct: 80, hPct: 5 }, typography: t.heading, content: "Ciclos de Vida" },
      { id: "cycle1_title", zIndex: 10, box: { xPct: 10, yPct: 22, wPct: 80, hPct: 3 }, typography: t.number, content: "{{person.cycles.first.title}}" },
      { id: "cycle1_body", zIndex: 10, box: { xPct: 10, yPct: 26, wPct: 80, hPct: 18 }, typography: t.body, content: "{{person.cycles.first.body}}" },
      { id: "cycle2_title", zIndex: 10, box: { xPct: 10, yPct: 46, wPct: 80, hPct: 3 }, typography: t.number, content: "{{person.cycles.second.title}}" },
      { id: "cycle2_body", zIndex: 10, box: { xPct: 10, yPct: 50, wPct: 80, hPct: 18 }, typography: t.body, content: "{{person.cycles.second.body}}" },
      { id: "cycle3_title", zIndex: 10, box: { xPct: 10, yPct: 70, wPct: 80, hPct: 3 }, typography: t.number, content: "{{person.cycles.third.title}}" },
      { id: "cycle3_body", zIndex: 10, box: { xPct: 10, yPct: 74, wPct: 80, hPct: 18 }, typography: t.body, content: "{{person.cycles.third.body}}" }
    ]
  }
];
