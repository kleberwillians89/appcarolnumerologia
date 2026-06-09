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

export const getProductMaterialConfig = (productKey: string): ProductMaterialConfig => {
  return PRODUCT_MATERIALS[productKey] || {
    productKey,
    productName: productKey,
    deliveryType: 'PDF_PERSONALIZADO',
    materials: [],
  };
};

export const getProductMaterials = (productKey: string) => getProductMaterialConfig(productKey).materials;

export const getProductDeliveryType = (productKey: string) => getProductMaterialConfig(productKey).deliveryType;

export const getProductConfiguredName = (productKey: string) => getProductMaterialConfig(productKey).productName;
