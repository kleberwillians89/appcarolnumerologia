export const dreamPages = [
  {
    id: "sonho-cover",
    background: { src: "/templates/8.jpg" },
    conditions: [{ path: "person.numbers.dream", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "sonho-slogan", box: { x: 12, y: 67, w: 76, h: 6 },
        content: "{{synopsis.dream}}",
        typography: { variant: "title", fontSize: 26, textAlign: "center", textColorHex: "#FFFFFF" } }
    ]
  },
  {
    id: "sonho-detalhe",
    background: { src: "/templates/9.jpg" },
    conditions: [{ path: "person.numbers.dream", includes: [1,2,3,4,5,6,7,8,9,11,22] }],
    placeholders: [
      { id: "sonho-title", box: { x: 10, y: 16.5, w: 80, h: 3.5 },
        content: "{{person.numbers.dream}} – {{person.interpretations.dreamTitle}}",
        typography: { variant: "title", fontSize: 22, textAlign: "center", textColorHex: "#112F4D" } },
      { id: "sonho-text", box: { x: 10, y: 22, w: 80, h: 60 },
        content: "{{person.interpretations.dreamText}}",
        typography: { variant: "body", fontSize: 12, textAlign: "left", textColorHex: "#262626" } }
    ]
  }
];
