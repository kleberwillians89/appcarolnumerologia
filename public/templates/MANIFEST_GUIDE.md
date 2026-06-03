# PDF Manifest System - Template Images Guide

## Image Files Required

Upload the following images to `public/templates/`:

### Fixed Pages
- `1.jpg` - Cover page (capa)
- `2.jpg` - Resume cards (mapa resumo)
- `3.jpg` - Introduction text (mapa da alma texto)

### Core Numbers (Soul, Destiny, Dream, Talent, Dom)
- `4.jpg` - Soul cover
- `5.jpg` - Soul detail
- `6.jpg` - Destiny cover
- `7.jpg` - Destiny detail
- `8.jpg` - Dream cover
- `9.jpg` - Dream detail
- `10.jpg` - Talent cover
- `11.jpg` - Talent detail
- `12.jpg` - Dom cover
- `13.jpg` - Dom detail

### Life Cycles
- `14.jpg` - Cycles intro
- `15.jpg` - 1st cycle detail
- `16.jpg` - 2nd cycle detail
- `17.jpg` - 3rd cycle detail

### Challenges
- `18.jpg` - Challenges intro
- `19.jpg` - 1st challenge detail
- `20.jpg` - 2nd challenge detail
- `21.jpg` - Major challenge detail

### Presents/Gifts
- `22.jpg` - Presents intro
- `23.jpg` - 1st present detail
- `24.jpg` - 2nd present detail
- `25.jpg` - 3rd present detail
- `26.jpg` - 4th present detail

### Personal Year
- `27.jpg` - Personal year intro
- `28.jpg` - Personal year detail

## Image Specifications

- **Format**: JPEG (.jpg)
- **Size**: 2480 x 3508 pixels (A4 at 300 DPI)
- **Color Mode**: RGB
- **Quality**: High (90%+)

## Manifest Structure

The manifest uses:
- **Box coordinates**: Percentages (0-100) of page dimensions
- **Typography variants**: "title" or "body"
- **Conditions**: Pages render only if conditions match
- **Placeholders**: Dynamic content areas with {{variable}} syntax

## Variable Syntax

Use double curly braces for dynamic content:
- `{{person.name}}` - Person's name
- `{{person.numbers.soul}}` - Soul number
- `{{texts.cyclesIntroduction}}` - Text content
