export const soulPages = [
  {
    id: "alma-cover",
    background: { src: "/templates/4.jpg" },
    conditions: [{ path: "person.numbers.soul", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "alma-slogan", box: { x: 12, y: 67, w: 76, h: 6 },
        content: "{{synopsis.soul}}",
        typography: { variant: "title", fontSize: 26, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },
  {
    id: "alma-detalhe",
    background: { src: "/templates/5.jpg" },
    conditions: [{ path: "person.numbers.soul", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "alma-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "{{person.numbers.soul}} – {{person.interpretations.soulTitle}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "alma-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.interpretations.soulText}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
