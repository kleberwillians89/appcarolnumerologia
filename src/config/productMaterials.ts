import type { PdfProductKey } from '@/services/pdfDeliveryService';

export type ProductDeliveryType = 'PDF_PERSONALIZADO' | 'PRONTA_ENTREGA' | 'ATENDIMENTO';
export type ProductMaterialType = 'video' | 'pdf' | 'link' | 'audio' | 'text';
export type ProductKey = PdfProductKey | 'curso_numerologia_basica';

export interface ProductMaterial {
  id: string;
  title: string;
  type: ProductMaterialType;
  url?: string;
  description?: string;
}

export interface ProductMaterialConfig {
  productKey: ProductKey | string;
  productName: string;
  deliveryType: ProductDeliveryType;
  materials: ProductMaterial[];
}

const configuredMaterial = (material: ProductMaterial) => material.url || material.type === 'text';

const normalizeProductKey = (value?: string | null) => {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const PRODUCT_ALIASES: Record<string, string> = {
  mapa: 'mapa',
  'mapa-da-alma': 'mapa',
  'mapa-numerologico': 'mapa',
  'desvende-seu-mapa': 'mapa',
  'desvende-o-seu-mapa': 'mapa',
  'ano-pessoal': 'ano_pessoal',
  'ano-pessoal-completo': 'ano_pessoal',
  ano_pessoal: 'ano_pessoal',
  'curso-numerologia-basica': 'curso_numerologia_basica',
  curso_numerologia_basica: 'curso_numerologia_basica',
};

export const PRODUCT_MATERIALS: Record<string, ProductMaterialConfig> = {
  mapa: {
    productKey: 'mapa',
    productName: 'Mapa da Alma',
    deliveryType: 'PDF_PERSONALIZADO',
    materials: [
      {
        id: 'mapa-video-boas-vindas',
        title: 'Vídeo de boas-vindas ao Mapa da Alma',
        type: 'video',
        url: import.meta.env.VITE_MATERIAL_MAPA_VIDEO_URL || '',
        description: 'Aula complementar para acompanhar a leitura do Mapa da Alma.',
      },
    ].filter(configuredMaterial),
  },
  ano_pessoal: {
    productKey: 'ano_pessoal',
    productName: 'Ano Pessoal',
    deliveryType: 'PDF_PERSONALIZADO',
    materials: [
      {
        id: 'ano-pessoal-video-ciclos',
        title: 'Vídeo sobre ciclos do Ano Pessoal',
        type: 'video',
        url: import.meta.env.VITE_MATERIAL_ANO_PESSOAL_VIDEO_URL || '',
        description: 'Aula complementar para entender o ciclo anual.',
      },
    ].filter(configuredMaterial),
  },
  curso_numerologia_basica: {
    productKey: 'curso_numerologia_basica',
    productName: 'Curso de Numerologia Básica',
    deliveryType: 'PRONTA_ENTREGA',
    materials: [
      {
        id: 'curso-numerologia-aula-1',
        title: 'Aula 1 - Introdução à Numerologia',
        type: 'video',
        url: import.meta.env.VITE_MATERIAL_CURSO_NUMEROLOGIA_AULA_1_URL || '',
        description: 'Produto de pronta entrega. Preencha a URL para liberar o acesso.',
      },
      {
        id: 'curso-numerologia-apostila',
        title: 'Apostila do curso',
        type: 'pdf',
        url: import.meta.env.VITE_MATERIAL_CURSO_NUMEROLOGIA_APOSTILA_URL || '',
      },
    ].filter(configuredMaterial),
  },
};

export const resolveProductMaterialKey = (product: unknown): string => {
  if (!product) return '';

  if (typeof product === 'string') {
    const normalized = normalizeProductKey(product);
    return PRODUCT_ALIASES[normalized] || PRODUCT_ALIASES[product] || normalized;
  }

  if (typeof product === 'object') {
    const productRecord = product as Record<string, unknown>;
    const candidates = [
      productRecord.productKey,
      productRecord.productId,
      productRecord.produto,
      productRecord.product,
      productRecord.productName,
      productRecord.tipoProduto,
      productRecord.tipo_produto,
      (productRecord.dadosCliente as Record<string, unknown> | undefined)?.productKey,
      (productRecord.dadosCliente as Record<string, unknown> | undefined)?.produto,
      (productRecord.dados_cliente as Record<string, unknown> | undefined)?.productKey,
      (productRecord.dados_cliente as Record<string, unknown> | undefined)?.produto,
    ];

    for (const candidate of candidates) {
      const key = resolveProductMaterialKey(candidate);
      if (key) return key;
    }
  }

  return '';
};

export const getProductMaterialConfig = (product: unknown): ProductMaterialConfig => {
  const productKey = resolveProductMaterialKey(product);
  return PRODUCT_MATERIALS[productKey] || {
    productKey,
    productName: productKey || 'Produto',
    deliveryType: 'PDF_PERSONALIZADO',
    materials: [],
  };
};

export const getProductMaterials = (product: unknown) => getProductMaterialConfig(product).materials;

export const getProductDeliveryType = (product: unknown) => getProductMaterialConfig(product).deliveryType;

export const getProductConfiguredName = (product: unknown) => getProductMaterialConfig(product).productName;
