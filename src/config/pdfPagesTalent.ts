export const talentPages = [
  {
    id: "talento-cover",
    background: { src: "/templates/10.jpg" },
    conditions: [{ path: "person.numbers.talent", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "talento-slogan", box: { x: 12, y: 67, w: 76, h: 6 },
        content: "{{synopsis.talent}}",
        typography: { variant: "title", fontSize: 26, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },
  {
    id: "talento-detalhe",
    background: { src: "/templates/11.jpg" },
    conditions: [{ path: "person.numbers.talent", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "talento-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "{{person.numbers.talent}} – {{person.interpretations.talentTitle}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "talento-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.interpretations.talentText}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
