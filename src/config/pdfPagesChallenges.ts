export const challengesPages = [
  // Capa (fixa, sem placeholders)
  {
    id: "challenge-cover",
    background: { src: "/templates/21.jpg" },
    placeholders: []
  },

  // Interpretação do Desafio (Maior + 1º + 2º)
  {
    id: "challenge-interpretation",
    background: { src: "/templates/22.jpg" },
    placeholders: [
      { id: "ch.title", box: { x: 8.5, y: 13.5, w: 83, h: 5 },
        content: "Desafios — Aprendizados da Vida",
        typography: { variant: "title", fontSize: 20, textAlign: "center", textColorHex: "#112F4D" } },

      { id: "ch.badge.major", box: { x: 10, y: 20, w: 18, h: 4 },
        content: "Desafio Maior: {{person.challenges.major.value}}",
        typography: { variant: "title", fontSize: 14, textAlign: "left", textColorHex: "#112F4D" } },

      { id: "ch.badge.first", box: { x: 40, y: 20, w: 18, h: 4 },
        content: "1º: {{person.challenges.first.value}}",
        typography: { variant: "title", fontSize: 13, textAlign: "left", textColorHex: "#112F4D" } },

      { id: "ch.badge.second", box: { x: 65, y: 20, w: 18, h: 4 },
        content: "2º: {{person.challenges.second.value}}",
        typography: { variant: "title", fontSize: 13, textAlign: "left", textColorHex: "#112F4D" } },

      { id: "ch.major.body", box: { x: 8.5, y: 25, w: 50, h: 63 },
        content: "{{person.challenges.major.interpretation}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } },

      { id: "ch.first.title", box: { x: 61.5, y: 25, w: 30, h: 3.8 },
        content: "1º Desafio — Nº {{person.challenges.first.value}}",
        typography: { variant: "title", fontSize: 13.5, textAlign: "left", textColorHex: "#112F4D" } },
      { id: "ch.first.body", box: { x: 61.5, y: 29, w: 30, h: 27 },
        content: "{{person.challenges.first.interpretation}}",
        typography: { variant: "body", fontSize: 11.2, textAlign: "left", textColorHex: "#262626" } },

      { id: "ch.second.title", box: { x: 61.5, y: 59, w: 30, h: 3.8 },
        content: "2º Desafio — Nº {{person.challenges.second.value}}",
        typography: { variant: "title", fontSize: 13.5, textAlign: "left", textColorHex: "#112F4D" } },
      { id: "ch.second.body", box: { x: 61.5, y: 63, w: 30, h: 25 },
        content: "{{person.challenges.second.interpretation}}",
        typography: { variant: "body", fontSize: 11.2, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
