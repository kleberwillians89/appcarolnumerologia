# Guia Visual de Backgrounds - Mapa da Alma PDF

## Estrutura Visual do PDF

```
┌─────────────────────────────────────────────────────────┐
│                      PÁGINA 1 - CAPA                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  │           pg1_capa.png (IMAGEM INTEGRAL)          │ │
│  │                                                    │ │
│  │  • Título "MAPA DA ALMA"                          │ │
│  │  • Decorações e elementos visuais                 │ │
│  │  • Espaço para nome e data                        │ │
│  │  • Footer com contato                             │ │
│  │                                                    │ │
│  │  SEM elementos adicionais renderizados            │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              PÁGINAS 2, 3, 4, 6, 7, 8, 9                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ HEADER (semi-transparente, opacity 0.85)          │ │
│  │ Logo | MAPA DA ALMA - Carol Graber                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ╔════════════════════════════════════════════════════╗ │
│  ║                                                    ║ │
│  ║         bg_2_Pdf.png (BACKGROUND COMPLETO)        ║ │
│  ║                                                    ║ │
│  ║  ┌──────────────────────────────────────────────┐ ║ │
│  ║  │                                              │ ║ │
│  ║  │  CONTEÚDO DA PÁGINA                          │ ║ │
│  ║  │  • Títulos (24pt, dourado)                   │ ║ │
│  ║  │  • Boxes (margin 32pt, radius 8pt)           │ ║ │
│  ║  │  • Cards com informações                     │ ║ │
│  ║  │  • Textos e descrições                       │ ║ │
│  ║  │                                              │ ║ │
│  ║  └──────────────────────────────────────────────┘ ║ │
│  ║                                                    ║ │
│  ╚════════════════════════════════════════════════════╝ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ FOOTER (semi-transparente, opacity 0.85)          │ │
│  │ Email | Página X | Nome do Usuário                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                PÁGINA 5 - CALENDÁRIO                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  │      pg5_calendario.png (IMAGEM INTEGRAL)         │ │
│  │                                                    │ │
│  │  • Calendário do Ano Pessoal                      │ │
│  │  • Grid de 12 meses                               │ │
│  │  • Previsões mensais                              │ │
│  │  • Oportunidades, Temas, Desafios                 │ │
│  │                                                    │ │
│  │  SEM header/footer ou elementos adicionais        │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Detalhes Técnicos

### Dimensões
- **Página A4**: 595 x 842 pontos (pt)
- **Margem**: 32pt em todos os lados
- **Área de conteúdo**: 531 x 778pt (595-64 x 842-64)

### Camadas de Renderização

#### Páginas 1 e 5 (Imagens Integrais)
```
Camada 1: Imagem de fundo (cobre 100% da página)
         └─> NENHUMA camada adicional
```

#### Páginas 2-4, 6-9 (Background + Conteúdo)
```
Camada 1: bg_2_Pdf.png (cobre 100% da página)
Camada 2: Header semi-transparente (topo, 50pt altura)
Camada 3: Footer semi-transparente (base, 30pt altura)
Camada 4: Conteúdo da página (área central)
         ├─> Títulos
         ├─> Boxes/Cards
         ├─> Textos
         └─> Elementos visuais
```

## Especificações de Imagens

### pg1_capa.png
- **Uso**: Página 1 completa
- **Conteúdo**: Capa com todos os elementos visuais
- **Formato**: PNG ou JPG
- **Dimensões**: 595x842pt ou maior (manter proporção)
- **Elementos inclusos**: Título, decorações, espaços para dados

### bg_2_Pdf.png
- **Uso**: Background das páginas 2-4, 6-9
- **Conteúdo**: Background decorativo
- **Formato**: PNG ou JPG
- **Dimensões**: 595x842pt ou maior (manter proporção)
- **Nota**: Será parcialmente coberto por header/footer/conteúdo

### pg5_calendario.png
- **Uso**: Página 5 completa
- **Conteúdo**: Calendário do Ano Pessoal completo
- **Formato**: PNG ou JPG
- **Dimensões**: 595x842pt ou maior (manter proporção)
- **Elementos inclusos**: Grid de meses, previsões, boxes informativos

## Paleta de Cores

### Cores Principais
- **Dourado**: RGB(201, 162, 39) - Títulos e destaques
- **Azul**: RGB(58, 102, 255) - Elementos de destaque
- **Texto escuro**: RGB(43, 43, 43) - Texto principal
- **Texto claro**: RGB(107, 114, 128) - Texto secundário

### Cores de Background
- **Painéis**: RGB(246, 245, 249) - Fundo claro de cards
- **Header/Footer**: RGB(40, 40, 45) - Fundo escuro semi-transparente
- **Branco**: RGB(255, 255, 255) - Texto sobre fundos escuros

## Padrões de Design

### Boxes e Cards
```
┌─────────────────────────────────────┐
│  Margin: 32pt                       │  ← Margem externa
│  ┌───────────────────────────────┐  │
│  │ Radius: 8pt                   │  │  ← Raio arredondado
│  │                               │  │
│  │  Conteúdo do card             │  │
│  │  • Título (14pt, bold)        │  │
│  │  • Texto (10pt, normal)       │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Tipografia
- **Títulos de página**: 24pt, Helvetica Bold, Dourado
- **Subtítulos**: 14-16pt, Helvetica Bold
- **Texto corpo**: 10pt, Helvetica Normal
- **Texto pequeno**: 8-9pt, Helvetica Normal

## Checklist de Implementação

### ✅ Página 1 - Capa
- [x] Carrega pg1_capa.png
- [x] Imagem cobre toda a página
- [x] Sem elementos adicionais renderizados
- [x] Sem header/footer

### ✅ Páginas 2-4, 6-9 - Conteúdo
- [x] Carrega bg_2_Pdf.png primeiro
- [x] Adiciona header semi-transparente
- [x] Adiciona footer semi-transparente
- [x] Renderiza conteúdo específico
- [x] Respeita margem 32pt
- [x] Usa raio 8pt em boxes

### ✅ Página 5 - Calendário
- [x] Carrega pg5_calendario.png
- [x] Imagem cobre toda a página
- [x] Sem elementos adicionais renderizados
- [x] Sem header/footer

## Ordem de Renderização

```typescript
// Páginas com imagem integral (1 e 5)
1. addBackgroundImage(pdf, '/templates/imagem.png')
2. FIM (sem elementos adicionais)

// Páginas com conteúdo (2-4, 6-9)
1. addBackgroundImage(pdf, '/templates/bg_2_Pdf.png')
2. addHeaderFooter(pdf, pageNum, userName)
   ├─> Renderiza header semi-transparente
   └─> Renderiza footer semi-transparente
3. renderPageContent(pdf, data)
   └─> Renderiza conteúdo específico da página
```
