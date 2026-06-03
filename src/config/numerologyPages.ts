import { PageManifest } from './pdfManifest';

export const numerologyPages: PageManifest[] = [
  {
    id: "cover",
    background: { src: "/templates/1.jpg" },
    placeholders: [
      { id: "cover-name", box: { x: 15, y: 19, w: 70, h: 6 }, content: "{{person.name}}",
        typography: { variant: "title", fontSize: 28, textAlign: "center", textColorHex: "#FFFFFF" } },
      { id: "cover-date", box: { x: 15, y: 24.5, w: 70, h: 4 }, content: "{{person.birthDateFormatted}}",
        typography: { variant: "body", fontSize: 16, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },

  {
    id: "resume",
    background: { src: "/templates/2.jpg" },
    placeholders: [
      { id: "resume-name", box: { x: 18, y: 9.6, w: 64, h: 3.4 }, content: "{{person.name}}",
        typography: { variant: "title", fontSize: 20, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "resume-date", box: { x: 18, y: 12.2, w: 64, h: 2.8 }, content: "{{person.birthDateFormatted}}",
        typography: { variant: "body", fontSize: 12, textAlign: "center", textColorHex: "#262626" } },
      { id: "resume-numbers", box: { x: 12, y: 32, w: 76, h: 13 },
        content: "ALMA: {{person.numbers.soul}}\nDESTINO: {{person.numbers.destiny}}\nSONHO: {{person.numbers.dream}}\nTALENTO: {{person.numbers.talent}}\nDOM: {{person.numbers.dom}}",
        typography: { variant: "title", fontSize: 18, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "resume-cycles", box: { x: 9, y: 61.5, w: 26, h: 21 },
        content: "1º CICLO: {{person.cycles.first.value}}\n0–28 anos\n\n2º CICLO: {{person.cycles.second.value}}\n29–56 anos\n\n3º CICLO: {{person.cycles.third.value}}\n57+ anos",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },
      { id: "resume-challenges", box: { x: 37, y: 61.5, w: 26, h: 21 },
        content: "1º DESAFIO: {{person.challenges.first.value}}\n0–28 anos\n\n2º DESAFIO: {{person.challenges.second.value}}\n29–56 anos\n\nDESAFIO MAIOR: {{person.challenges.major.value}}\nVida toda",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },
      { id: "resume-presents", box: { x: 65, y: 61.5, w: 26, h: 21 },
        content: "1º PRESENTE: {{person.presents.first.value}}\n0–29 anos\n\n2º PRESENTE: {{person.presents.second.value}}\n30–39 anos\n\n3º PRESENTE: {{person.presents.third.value}}\n40–49 anos\n\n4º PRESENTE: {{person.presents.fourth.value}}\n50+ anos",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },

  {
    id: "intro-texts",
    background: { src: "/templates/3.jpg" },
    placeholders: [
      { id: "intro-cycles", box: { x: 7.8, y: 22.6, w: 38.5, h: 58 }, content: "{{texts.lifeCyclesIntro}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },
      { id: "intro-presents", box: { x: 53.7, y: 22.6, w: 38.5, h: 25.5 }, content: "{{texts.presentsIntro}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },
      { id: "intro-challenges", box: { x: 53.7, y: 52.5, w: 38.5, h: 31 }, content: "{{texts.challengesIntro}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
     ]
  },

  {
    id: "alma-cover",
    background: { src: "/templates/4.jpg" },
    conditions: [{ path: "person.numbers.soul", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "alma-cover-slogan", box: { x: 12, y: 67, w: 76, h: 6 }, content: "{{synopsis.soul}}",
        typography: { variant: "title", fontSize: 26, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },

  {
    id: "alma-detail",
    background: { src: "/templates/5.jpg" },
    conditions: [{ path: "person.numbers.soul", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "alma-detail-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 }, content: "{{person.numbers.soul}}",
        typography: { variant: "title", fontSize: 36, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "alma-detail-body", box: { x: 10, y: 22, w: 80, h: 70 }, content: "{{person.interpretations.soul.description}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },

  {
    id: "destiny-cover",
    background: { src: "/templates/6.jpg" },
    conditions: [{ path: "person.numbers.destiny", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "destiny-cover-slogan", box: { x: 12, y: 67, w: 76, h: 6 }, content: "{{synopsis.destiny}}",
        typography: { variant: "title", fontSize: 26, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },

  {
    id: "destiny-detail",
    background: { src: "/templates/7.jpg" },
    conditions: [{ path: "person.numbers.destiny", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "destiny-detail-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 }, content: "{{person.numbers.destiny}}",
        typography: { variant: "title", fontSize: 36, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "destiny-detail-body", box: { x: 10, y: 22, w: 80, h: 70 }, content: "{{person.interpretations.destiny.description}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },

  {
    id: "dom-cover",
    background: { src: "/templates/8.jpg" },
    conditions: [{ path: "person.numbers.dom", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "dom-cover-slogan", box: { x: 12, y: 67, w: 76, h: 6 }, content: "{{synopsis.dom}}",
        typography: { variant: "title", fontSize: 26, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },

  {
    id: "dom-detail",
    background: { src: "/templates/9.jpg" },
    conditions: [{ path: "person.numbers.dom", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "dom-detail-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 }, content: "{{person.numbers.dom}}",
        typography: { variant: "title", fontSize: 36, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "dom-detail-body", box: { x: 10, y: 22, w: 80, h: 70 }, content: "{{person.interpretations.dom.description}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },

  {
    id: "talent-cover",
    background: { src: "/templates/10.jpg" },
    conditions: [{ path: "person.numbers.talent", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "talent-cover-slogan", box: { x: 12, y: 67, w: 76, h: 6 }, content: "{{synopsis.talent}}",
        typography: { variant: "title", fontSize: 26, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },

  {
    id: "talent-detail",
    background: { src: "/templates/11.jpg" },
    conditions: [{ path: "person.numbers.talent", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "talent-detail-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 }, content: "{{person.numbers.talent}}",
        typography: { variant: "title", fontSize: 36, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "talent-detail-body", box: { x: 10, y: 22, w: 80, h: 70 }, content: "{{person.interpretations.talent.description}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },

  {
    id: "dream-cover",
    background: { src: "/templates/12.jpg" },
    conditions: [{ path: "person.numbers.dream", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "dream-cover-slogan", box: { x: 12, y: 67, w: 76, h: 6 }, content: "{{synopsis.dream}}",
        typography: { variant: "title", fontSize: 26, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },

  {
    id: "dream-detail",
    background: { src: "/templates/13.jpg" },
    conditions: [{ path: "person.numbers.dream", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "dream-detail-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 }, content: "{{person.numbers.dream}}",
        typography: { variant: "title", fontSize: 36, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "dream-detail-body", box: { x: 10, y: 22, w: 80, h: 70 }, content: "{{person.interpretations.dream.description}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
