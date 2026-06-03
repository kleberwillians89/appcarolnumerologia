export const personalYearPages = [
  {
    id: "personal-year-intro",
    background: { src: "/templates/27.jpg" },
    placeholders: [
      { id: "py-intro-text", box: { x: 10, y: 20, w: 80, h: 65 },
        content: "{{texts.personalYearIntro}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },

  // Página única: Ano Pessoal + 4 CTs
  {
    id: "py-cts-onepage",
    background: { src: "/templates/28.jpg" }, // ou "/templates/20.jpg" se preferir aquele fundo
    placeholders: [
      // Título
      { id: "py.title", box: { x: 8.5, y: 13.5, w: 83, h: 5 },
        content: "Ano Pessoal {{person.personalYear.value}}",
        typography: { variant: "title", fontSize: 20, textAlign: "center", textColorHex: "#112F4D" } },

      // Coluna esquerda: texto do Ano Pessoal
      { id: "py.body", box: { x: 8.5, y: 21.5, w: 50, h: 60 },
        content: "{{person.personalYear.interpretation}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },

      // Coluna direita: CT1…CT4 (ajuste suas chaves conforme seu cálculo)
      { id: "ct1.title", box: { x: 61.5, y: 21.5, w: 30, h: 3.8 },
        content: "CT1 — Nº {{person.quarters.0.ctNumber}}",
        typography: { variant: "title", fontSize: 13.5, textAlign: "left", textColorHex: "#112F4D" } },
      { id: "ct1.body", box: { x: 61.5, y: 25.8, w: 30, h: 11.5 },
        content: "{{person.quarters.0.description}}",
        typography: { variant: "body", fontSize: 11.2, textAlign: "left", textColorHex: "#262626" } },

      { id: "ct2.title", box: { x: 61.5, y: 38.5, w: 30, h: 3.8 },
        content: "CT2 — Nº {{person.quarters.1.ctNumber}}",
        typography: { variant: "title", fontSize: 13.5, textAlign: "left", textColorHex: "#112F4D" } },
      { id: "ct2.body", box: { x: 61.5, y: 42.8, w: 30, h: 11.5 },
        content: "{{person.quarters.1.description}}",
        typography: { variant: "body", fontSize: 11.2, textAlign: "left", textColorHex: "#262626" } },

      { id: "ct3.title", box: { x: 61.5, y: 55.5, w: 30, h: 3.8 },
        content: "CT3 — Nº {{person.quarters.2.ctNumber}}",
        typography: { variant: "title", fontSize: 13.5, textAlign: "left", textColorHex: "#112F4D" } },
      { id: "ct3.body", box: { x: 61.5, y: 59.8, w: 30, h: 11.5 },
        content: "{{person.quarters.2.description}}",
        typography: { variant: "body", fontSize: 11.2, textAlign: "left", textColorHex: "#262626" } },

      { id: "ct4.title", box: { x: 61.5, y: 72.5, w: 30, h: 3.8 },
        content: "CT4 — Nº {{person.quarters.3.ctNumber}}",
        typography: { variant: "title", fontSize: 13.5, textAlign: "left", textColorHex: "#112F4D" } },
      { id: "ct4.body", box: { x: 61.5, y: 76.8, w: 30, h: 11.5 },
        content: "{{person.quarters.3.description}}",
        typography: { variant: "body", fontSize: 11.2, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
