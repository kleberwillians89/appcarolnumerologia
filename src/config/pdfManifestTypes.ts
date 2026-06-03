// src/config/pdfManifestsTypes.ts

export interface Typography {
  // Novo formato (recomendado)
  fontFamily?: string;
  fontWeight?: 400 | 500 | 600 | 700 | 800;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize';

  // Formato legado (ainda suportado)
  variant?: 'title' | 'body';
  textColorHex?: string;
}

export interface Box {
  // Percentuais (novo padrão dos seus manifests)
  x?: number;  // % da largura
  y?: number;  // % da altura
  w?: number;  // % da largura
  h?: number;  // % da altura

  // Alternativa usada em alguns compat manifests
  xPct?: number;
  yPct?: number;
  wPct?: number;
  hPct?: number;
}

export interface Placeholder {
  id: string;
  box: Box;
  typography: Typography;
  content: string;
  zIndex?: number;
}

export interface ConditionFnData {
  [key: string]: any;
}

export interface PageManifest {
  id?: string;
  page?: string; // alguns compat manifests usam "page"
  background: { src: string; type?: 'image'; size?: 'cover' | 'contain' };
  placeholders: Placeholder[];
  // alguns manifests usam condição como função
  condition?: (data: ConditionFnData) => boolean;
  // outros usam condições declarativas (não obrigatório aqui)
  conditions?: Array<{ path: string; includes: any[] }>;
}

export interface PDFManifest {
  pageSize: { w: number; h: number; unit: string };
  defaults: {
    fontFamily: string;
    titleColor: string;
    bodyColor: string;
    lineHeight: number;
  };
  pages: PageManifest[];
}
