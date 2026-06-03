export const resumeAndIntroPages = [
  {
    id: "resume-cards",
    background: { src: "/templates/2.jpg" },
    placeholders: [
      { id: "resume-name", box: { x: 18, y: 9.6, w: 64, h: 3.4 }, content: "{{person.name}}",
        typography: { variant: "title", fontSize: 20, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "resume-date", box: { x: 18, y: 12.2, w: 64, h: 2.8 }, content: "{{person.birthDateFormatted}}",
        typography: { variant: "body", fontSize: 12, textAlign: "center", textColorHex: "#262626" } },
      { id: "card-alma", box: { x: 12, y: 32, w: 76, h: 13 },
        content: "ALMA: {{person.numbers.soul}}\\nDESTINO: {{person.numbers.destiny}}\\nSONHO: {{person.numbers.dream}}\\nTALENTO: {{person.numbers.talent}}\\nDOM: {{person.numbers.dom}}",
        typography: { variant: "title", fontSize: 18, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "box-cycles", box: { x: 9, y: 61.5, w: 26, h: 21 },
        content: "1º CICLO: {{person.cycles.first.value}}\\n0–28 anos\\n\\n2º CICLO: {{person.cycles.second.value}}\\n29–56 anos\\n\\n3º CICLO: {{person.cycles.third.value}}\\n57+ anos",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },
      { id: "box-challenges", box: { x: 37, y: 61.5, w: 26, h: 21 },
        content: "1º DESAFIO: {{person.challenges.first.value}}\\n0–28 anos\\n\\n2º DESAFIO: {{person.challenges.second.value}}\\n29–56 anos\\n\\nDESAFIO MAIOR: {{person.challenges.major.value}}\\nVida toda",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },
      { id: "box-presents", box: { x: 65, y: 61.5, w: 26, h: 21 },
        content: "1º PRESENTE: {{person.presents.first.value}}\\n0–29 anos\\n\\n2º PRESENTE: {{person.presents.second.value}}\\n30–39 anos\\n\\n3º PRESENTE: {{person.presents.third.value}}\\n40–49 anos\\n\\n4º PRESENTE: {{person.presents.fourth.value}}\\n50+ anos",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },
  {
    id: "mapa-da-alma-texto",
    background: { src: "/templates/3.jpg" },
    placeholders: [
      { id: "lc-left", box: { x: 7.8, y: 22.6, w: 38.5, h: 58 },
        content: "{{texts.lifeCyclesIntroLeft}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },
      { id: "lc-right-top", box: { x: 53.7, y: 22.6, w: 38.5, h: 25.5 },
        content: "{{texts.presentsIntro}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },
      { id: "lc-right-bottom", box: { x: 53.7, y: 52.5, w: 38.5, h: 31 },
        content: "{{texts.challengesIntro}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
