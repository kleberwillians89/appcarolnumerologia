import { resumeAndIntroPages } from './pdfPages1';
import { soulPages } from './pdfPagesSoul';
import { destinyPages } from './pdfPagesDestiny';
import { dreamPages } from './pdfPagesDream';
import { talentPages } from './pdfPagesTalent';
import { domPages } from './pdfPagesDom';
import { cyclesPages } from './pdfPagesCycles';
import { challengesPages } from './pdfPagesChallenges';
import { presentsPages } from './pdfPagesPresents';
import { personalYearPages } from './pdfPagesPersonalYear';

export const pdfManifest = {
  pageSize: { w: 2480, h: 3508, unit: "px" },
  defaults: {
    fontFamily: "Montserrat",
    titleColor: "#112F4D",
    bodyColor: "#262626",
    lineHeight: 1.4
  },
  pages: [
    {
      id: "cover-fixed",
      background: { src: "/templates/1.jpg" },
      placeholders: [
        {
          id: "name",
          box: { x: 15, y: 19, w: 70, h: 6 },
          content: "{{person.name}}",
          typography: { variant: "title", fontSize: 28, textAlign: "center", textColorHex: "#FFFFFF" }
        },
        {
          id: "date",
          box: { x: 15, y: 24.5, w: 70, h: 4 },
          content: "{{person.birthDateFormatted}}",
          typography: { variant: "body", fontSize: 16, textAlign: "center", textColorHex: "#FFFFFF" }
        }
      ]
    },
    ...resumeAndIntroPages,
    ...soulPages,
    ...destinyPages,
    ...dreamPages,
    ...talentPages,
    ...domPages,
    ...cyclesPages,
    ...challengesPages,
    ...presentsPages,
    ...personalYearPages
  ]
};

export const getManifestForPage = (pageName: string) => {
  // Legacy compatibility - map old page names to new structure
  const legacyMap: Record<string, any> = {
    cover: { backgroundImage: '/templates/1.jpg', elements: [] },
    resume: { backgroundImage: '/templates/2.jpg', elements: [] },
    lifePathNumber: { backgroundImage: '/templates/5.jpg', elements: [] },
    destinyNumber: { backgroundImage: '/templates/7.jpg', elements: [] },
    soulNumber: { backgroundImage: '/templates/5.jpg', elements: [] },
    personalityNumber: { backgroundImage: '/templates/11.jpg', elements: [] },
    birthdayNumber: { backgroundImage: '/templates/13.jpg', elements: [] },
    maturityNumber: { backgroundImage: '/templates/15.jpg', elements: [] },
    lifeCycles: { backgroundImage: '/templates/17.jpg', elements: [] },
    challengeNumbers: { backgroundImage: '/templates/19.jpg', elements: [] },
    presentsAndChallenges: { backgroundImage: '/templates/23.jpg', elements: [] },
    quarterCycles: { backgroundImage: '/templates/25.jpg', elements: [] },
    personalYear: { backgroundImage: '/templates/28.jpg', elements: [] }
  };
  
  return legacyMap[pageName] || { backgroundImage: '', elements: [] };
};
