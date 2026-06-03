import { PageManifest } from './pdfManifestTypes';

export const overviewPage: PageManifest = {
  id: "overview",
  background: { src: "/templates/overview_base.jpg" },
  placeholders: [
    {
      id: "person.name",
      box: { x: 50, y: 15, w: 50, h: 4 },
      typography: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 24, lineHeight: 1.2, color: "#112f4d", textAlign: "center", letterSpacing: 0 },
      content: "{{person.name}}"
    },
    {
      id: "person.birth",
      box: { x: 50, y: 19.5, w: 50, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 500, fontSize: 14, lineHeight: 1.2, color: "#262626", textAlign: "center" },
      content: "{{person.birthDateBR}}"
    },
    {
      id: "overview.alma.label",
      box: { x: 18, y: 39.5, w: 20, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "ALMA:"
    },
    {
      id: "overview.alma.value",
      box: { x: 37.5, y: 39.5, w: 5, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 800, fontSize: 16, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "{{numbers.soul}}"
    },
    {

      id: "overview.destino.label",
      box: { x: 18, y: 43, w: 20, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "DESTINO:"
    },
    {
      id: "overview.destino.value",
      box: { x: 37.5, y: 43, w: 5, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 800, fontSize: 16, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "{{numbers.destiny}}"
    },
    {
      id: "overview.sonho.label",
      box: { x: 18, y: 46.5, w: 20, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "SONHO:"
    },
    {
      id: "overview.sonho.value",
      box: { x: 37.5, y: 46.5, w: 5, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 800, fontSize: 16, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "{{numbers.dream}}"
    },
    {
      id: "overview.talento.label",
      box: { x: 18, y: 50, w: 20, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "TALENTO:"
    },
    {
      id: "overview.talento.value",
      box: { x: 37.5, y: 50, w: 5, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 800, fontSize: 16, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "{{numbers.talent}}"
    },
    {
      id: "overview.dom.label",
      box: { x: 18, y: 53.5, w: 20, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "DOM:"
    },
    {
      id: "overview.dom.value",
      box: { x: 37.5, y: 53.5, w: 5, h: 3.2 },
      typography: { fontFamily: "Montserrat", fontWeight: 800, fontSize: 16, lineHeight: 1.2, color: "#112f4d", textAlign: "left" },
      content: "{{numbers.dom}}"
    },
    {
      id: "overview.cycle1",
      box: { x: 10.5, y: 66.5, w: 22, h: 16.5 },
      typography: { fontFamily: "Montserrat", fontWeight: 600, fontSize: 12, lineHeight: 1.32, color: "#112f4d", textAlign: "left" },
      content: "1º CICLO: {{cycles.first.value}}\n0–28 anos"
    },
    {
      id: "overview.cycle2",
      box: { x: 39.5, y: 66.5, w: 22, h: 16.5 },
      typography: { fontFamily: "Montserrat", fontWeight: 600, fontSize: 12, lineHeight: 1.32, color: "#112f4d", textAlign: "left" },
      content: "2º CICLO: {{cycles.second.value}}\n29–56 anos"
    },
    {
      id: "overview.cycle3",
      box: { x: 68.5, y: 66.5, w: 22, h: 16.5 },
      typography: { fontFamily: "Montserrat", fontWeight: 600, fontSize: 12, lineHeight: 1.32, color: "#112f4d", textAlign: "left" },
      content: "3º CICLO: {{cycles.third.value}}\n57+ anos"
    }
  ]
};
