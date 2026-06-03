import { PageManifest } from './pdfManifest';

const t = {
  title: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 18, lineHeight: 1.4, color: "#112F4D", textAlign: "left" as const },
  body: { fontFamily: "Montserrat", fontWeight: 400, fontSize: 11, lineHeight: 1.4, color: "#262626", textAlign: "left" as const },
  heading: { fontFamily: "Montserrat", fontWeight: 600, fontSize: 20, lineHeight: 1.4, color: "#112F4D", textAlign: "center" as const },
  number: { fontFamily: "Montserrat", fontWeight: 600, fontSize: 16, lineHeight: 1.4, color: "#112F4D", textAlign: "left" as const },
};

const bgImg = "https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760570280071_db2ec386.png";

export const numerologyManifest1: PageManifest[] = [
  {
    page: "soul",
    background: { type: "image", src: bgImg, size: "cover" },
    placeholders: [
      { id: "title", zIndex: 10, box: { xPct: 10, yPct: 15, wPct: 80, hPct: 5 }, typography: t.heading, content: "Número da Alma" },
      { id: "number", zIndex: 10, box: { xPct: 10, yPct: 22, wPct: 80, hPct: 4 }, typography: t.number, content: "{{person.numbers.soul}}" },
      { id: "description", zIndex: 10, box: { xPct: 10, yPct: 30, wPct: 80, hPct: 60 }, typography: t.body, content: "{{person.interpretations.soul.description}}" }
    ]
  },
  {
    page: "dom",
    background: { type: "image", src: bgImg, size: "cover" },
    placeholders: [
      { id: "title", zIndex: 10, box: { xPct: 10, yPct: 15, wPct: 80, hPct: 5 }, typography: t.heading, content: "Número do Dom" },
      { id: "number", zIndex: 10, box: { xPct: 10, yPct: 22, wPct: 80, hPct: 4 }, typography: t.number, content: "{{person.numbers.dom}}" },
      { id: "description", zIndex: 10, box: { xPct: 10, yPct: 30, wPct: 80, hPct: 60 }, typography: t.body, content: "{{person.interpretations.dom.description}}" }
    ]
  },
  {
    page: "destiny",
    background: { type: "image", src: bgImg, size: "cover" },
    placeholders: [
      { id: "title", zIndex: 10, box: { xPct: 10, yPct: 15, wPct: 80, hPct: 5 }, typography: t.heading, content: "Número do Destino" },
      { id: "number", zIndex: 10, box: { xPct: 10, yPct: 22, wPct: 80, hPct: 4 }, typography: t.number, content: "{{person.numbers.destiny}}" },
      { id: "description", zIndex: 10, box: { xPct: 10, yPct: 30, wPct: 80, hPct: 60 }, typography: t.body, content: "{{person.interpretations.destiny.description}}" }
    ]
  }
];
