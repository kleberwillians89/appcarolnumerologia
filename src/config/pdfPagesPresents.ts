export const presentsPages = [
  {
    id: "presents-intro",
    background: { src: "/templates/22.jpg" },
    placeholders: [
      { id: "presents-intro-text", box: { x: 10, y: 20, w: 80, h: 65 },
        content: "{{texts.presentsIntroduction}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },
  {
    id: "present-1-detail",
    background: { src: "/templates/23.jpg" },
    placeholders: [
      { id: "present1-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "1º PRESENTE (0-29 anos): {{person.presents.first.value}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "present1-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.presents.first.interpretation}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },
  {
    id: "present-2-detail",
    background: { src: "/templates/24.jpg" },
    placeholders: [
      { id: "present2-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "2º PRESENTE (30-39 anos): {{person.presents.second.value}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "present2-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.presents.second.interpretation}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },
  {
    id: "present-3-detail",
    background: { src: "/templates/25.jpg" },
    placeholders: [
      { id: "present3-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "3º PRESENTE (40-49 anos): {{person.presents.third.value}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "present3-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.presents.third.interpretation}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  },
  {
    id: "present-4-detail",
    background: { src: "/templates/26.jpg" },
    placeholders: [
      { id: "present4-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "4º PRESENTE (50+ anos): {{person.presents.fourth.value}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "present4-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.presents.fourth.interpretation}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
