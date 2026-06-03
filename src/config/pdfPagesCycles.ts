export const cyclesPages = [
  {
    id: "cycles-intro",
    background: { src: "/templates/14.jpg" },
    placeholders: [
      { id: "cycles-intro-text", box: { x: 10, y: 20, w: 80, h: 65 },
        content: "{{texts.cyclesIntroduction}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },
  {
    id: "cycle-1-detail",
    background: { src: "/templates/15.jpg" },
    placeholders: [
      { id: "cycle1-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "1º CICLO (0-28 anos): {{person.cycles.first.value}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "cycle1-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.cycles.first.interpretation}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },
  {
    id: "cycle-2-detail",
    background: { src: "/templates/16.jpg" },
    placeholders: [
      { id: "cycle2-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "2º CICLO (29-56 anos): {{person.cycles.second.value}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "cycle2-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.cycles.second.interpretation}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },
  {
    id: "cycle-3-detail",
    background: { src: "/templates/17.jpg" },
    placeholders: [
      { id: "cycle3-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "3º CICLO (57+ anos): {{person.cycles.third.value}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "cycle3-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.cycles.third.interpretation}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
