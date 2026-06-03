export const destinyPages = [
  {
    id: "destino-cover",
    background: { src: "/templates/6.jpg" },
    conditions: [{ path: "person.numbers.destiny", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "destino-slogan", box: { x: 12, y: 67, w: 76, h: 6 },
        content: "{{synopsis.destiny}}",
        typography: { variant: "title", fontSize: 26, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },
  {
    id: "destino-detalhe",
    background: { src: "/templates/7.jpg" },
    conditions: [{ path: "person.numbers.destiny", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "destino-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "{{person.numbers.destiny}} – {{person.interpretations.destinyTitle}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "destino-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.interpretations.destinyText}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
