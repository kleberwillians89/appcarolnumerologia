# PDF Manifest System - Complete Guide

## Overview

The PDF manifest system allows you to define PDF pages with:
- Background images (JPG templates)
- Text placeholders with dynamic content
- Typography controls (font, size, color, alignment)
- Conditional rendering based on numerology numbers
- Box positioning in percentages (0-100)

## File Structure

```
src/config/
├── pdfManifest.ts          # Main manifest aggregator
├── pdfManifestTypes.ts     # TypeScript interfaces
├── pdfPages1.ts            # Resume & intro pages
├── pdfPagesSoul.ts         # Soul number pages
├── pdfPagesDestiny.ts      # Destiny number pages
├── pdfPagesDream.ts        # Dream number pages
├── pdfPagesTalent.ts       # Talent number pages
├── pdfPagesDom.ts          # Dom number pages
├── pdfPagesCycles.ts       # Life cycles pages
├── pdfPagesChallenges.ts   # Challenge pages
├── pdfPagesPresents.ts     # Presents pages
├── pdfPagesPersonalYear.ts # Personal year pages
└── pdfTexts.ts             # Fixed text content

public/templates/
├── 1.jpg                   # Cover page
├── 2.jpg                   # Resume cards
├── 3.jpg                   # Mapa da Alma text
├── 4.jpg - 28.jpg          # Other templates
```

## Page Structure

Each page has:
```typescript
{
  id: "unique-page-id",
  background: { src: "/templates/X.jpg" },
  conditions: [                          // Optional
    { path: "person.numbers.soul", includes: [1,2,3,4,5,6,7,8,9,11,22] }
  ],
  placeholders: [
    {
      id: "unique-placeholder-id",
      box: { x: 15, y: 19, w: 70, h: 6 },  // % of page
      content: "{{person.name}}",           // Template string
      typography: {
        variant: "title",                   // or "body"
        fontSize: 28,
        textAlign: "center",                // left, center, right
        textColorHex: "#FFFFFF"
      }
    }
  ]
}
```

## Available Placeholders

### Person Data
- `{{person.name}}` - Full name
- `{{person.birthDateFormatted}}` - Formatted birth date

### Numbers
- `{{person.numbers.soul}}` - Soul number
- `{{person.numbers.destiny}}` - Destiny number
- `{{person.numbers.dream}}` - Dream number
- `{{person.numbers.talent}}` - Talent number
- `{{person.numbers.dom}}` - Dom number

### Cycles
- `{{person.cycles.first.value}}` - 1st cycle number
- `{{person.cycles.second.value}}` - 2nd cycle number
- `{{person.cycles.third.value}}` - 3rd cycle number

### Challenges
- `{{person.challenges.first.value}}` - 1st challenge
- `{{person.challenges.second.value}}` - 2nd challenge
- `{{person.challenges.major.value}}` - Major challenge

### Presents
- `{{person.presents.first.value}}` - 1st present
- `{{person.presents.second.value}}` - 2nd present
- `{{person.presents.third.value}}` - 3rd present
- `{{person.presents.fourth.value}}` - 4th present

### Fixed Texts (from pdfTexts.ts)
- `{{texts.lifeCyclesIntroLeft}}` - Life cycles explanation
- `{{texts.presentsIntro}}` - Presents introduction
- `{{texts.challengesIntro}}` - Challenges introduction

## Typography Variants

**title**: Bold, larger, for headings
**body**: Normal weight, for paragraphs

## Box Positioning

Boxes use percentage coordinates (0-100):
- `x`: Left position (0 = left edge, 100 = right edge)
- `y`: Top position (0 = top, 100 = bottom)
- `w`: Width
- `h`: Height

Example: `{ x: 15, y: 19, w: 70, h: 6 }` = centered box

## Conditions

Pages can be conditional based on numerology numbers:

```typescript
conditions: [
  { path: "person.numbers.soul", includes: [1,2,3,4,5,6,7,8,9,11,22] }
]
```

Only renders if soul number matches one of the values.

## Adding New Pages

1. Add template image to `public/templates/`
2. Define page in appropriate `pdfPagesXXX.ts` file
3. Export from that file
4. Import and add to `allPages` array in `pdfManifest.ts`

## Important Notes

- Background images should be 2480x3508px (A4 at 300dpi)
- Labels like "ALMA", "DESTINO" should be in the JPG, not as placeholders
- Use `\\n` for line breaks in content strings
- Line height defaults to 1.4
- Montserrat font (fallback: Helvetica)
- Text automatically wraps within box width
- Text truncates if exceeding box height
