import type { PdfProductKey } from '@/services/pdfDeliveryService';

export interface CatalogProduct {
  key: string;
  name: string;
  shortName: string;
  description: string;
  includes: string[];
  price: string;
  pdfTemplateKey: PdfProductKey;
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    key: 'desvende_mapa',
    name: 'Desvende seu Mapa',
    shortName: 'Mapa completo',
    description: 'Uma leitura personalizada para compreender essência, talentos, desafios e caminhos.',
    includes: ['Análise numerológica personalizada', 'PDF preparado pela Carol', 'Entrega na sua área'],
    price: 'R$ 197,00',
    pdfTemplateKey: 'mapa',
  },
  {
    key: 'nome_profissional_marca',
    name: 'Nome Profissional ou Marca',
    shortName: 'Nome e posicionamento',
    description: 'Análise para alinhar assinatura profissional, marca e posicionamento energético.',
    includes: ['Leitura do nome escolhido', 'Orientação personalizada', 'PDF preparado pela Carol'],
    price: 'R$ 297,00',
    pdfTemplateKey: 'mapa',
  },
  {
    key: 'data_cesarea',
    name: 'Data para Cesárea',
    shortName: 'Escolha de data',
    description: 'Estudo numerológico para apoiar a escolha consciente de uma data de nascimento.',
    includes: ['Avaliação das datas', 'Leitura personalizada', 'PDF preparado pela Carol'],
    price: 'R$ 347,00',
    pdfTemplateKey: 'mapa',
  },
  {
    key: 'nome_bebe',
    name: 'Nome do Bebê',
    shortName: 'Análise de nomes',
    description: 'Avaliação de nomes para apoiar uma escolha harmônica, consciente e significativa.',
    includes: ['Comparação dos nomes', 'Orientação personalizada', 'PDF preparado pela Carol'],
    price: 'R$ 297,00',
    pdfTemplateKey: 'mapa',
  },
  {
    key: 'abertura_empresa',
    name: 'Abertura de Empresa',
    shortName: 'Novo ciclo empresarial',
    description: 'Análise de datas e vibração numerológica para começar um novo ciclo empresarial.',
    includes: ['Avaliação numerológica', 'Orientação para o novo ciclo', 'PDF preparado pela Carol'],
    price: 'R$ 397,00',
    pdfTemplateKey: 'mapa',
  },
];

export const getCatalogProduct = (productKey: string) => CATALOG_PRODUCTS.find((product) => product.key === productKey);

export const getPdfTemplateKey = (productKey: string): PdfProductKey => getCatalogProduct(productKey)?.pdfTemplateKey
  || (productKey === 'ano_pessoal' ? 'ano_pessoal' : 'mapa');
