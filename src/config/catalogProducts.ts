import type { PdfProductKey } from '@/services/pdfDeliveryService';

export type CatalogGroup = 'Produtos Digitais' | 'Sessões Individuais' | 'Família' | 'Negócios' | 'Premium';
export type ProductJourneyType = 'auto_contratacao' | 'atendimento';

export interface CatalogProduct {
  key: string;
  name: string;
  shortName: string;
  category: string;
  group: CatalogGroup;
  description: string;
  format: string;
  delivery: string;
  productType: string;
  journeyType: ProductJourneyType;
  buttonLabel: 'Quero contratar' | 'Agendar atendimento';
  calendarUrl?: string;
  benefits: string[];
  price: string;
  pdfTemplateKey: PdfProductKey;
}

export const CATALOG_GROUPS: CatalogGroup[] = ['Produtos Digitais', 'Sessões Individuais', 'Família', 'Negócios', 'Premium'];

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  { key: 'desvende_mapa', name: 'Desvende seu Mapa', shortName: 'Produto digital personalizado', category: 'Produto digital', group: 'Produtos Digitais', price: 'R$ 397', format: 'Produto digital, sem sessão ao vivo', delivery: 'PDF personalizado + vídeos explicativos', description: 'Versão digital e escalável do Mapa da Alma. A pessoa preenche os dados e recebe um PDF personalizado com seus principais números.', productType: 'Produto de entrada', journeyType: 'auto_contratacao', buttonLabel: 'Quero contratar', benefits: ['PDF personalizado', 'Vídeos explicativos', 'Acesso pela Minha Área'], pdfTemplateKey: 'mapa' },
  { key: 'revisao_numerologica_anual', name: 'Revisão Numerológica Anual', shortName: 'Recompra anual', category: 'Recorrência anual', group: 'Sessões Individuais', price: 'R$ 730', format: 'Sessão ao vivo pelo Zoom, cerca de 1h', delivery: 'Sessão individual, gravação pelo WhatsApp e PDF do Ano Pessoal', description: 'Atualização para quem já fez o Mapa Numerológico Pessoal, revisando novo ciclo, Ano Pessoal e movimentos importantes.', productType: 'Recompra anual', journeyType: 'atendimento', buttonLabel: 'Agendar atendimento', benefits: ['Sessão individual', 'Gravação ou áudio', 'PDF do Ano Pessoal'], pdfTemplateKey: 'ano_pessoal' },
  { key: 'mapa_numerologico_pessoal', name: 'Mapa Numerológico Pessoal', shortName: 'Leitura profunda individual', category: 'Atendimento individual', group: 'Sessões Individuais', price: 'R$ 1.090', format: 'Sessão ao vivo pelo Zoom, cerca de 1h30', delivery: 'Atendimento, gravação pelo WhatsApp e PDF completo', description: 'Leitura profunda do mapa para compreender essência, talentos, desafios, propósito, ciclos de vida e momento atual.', productType: 'Alto valor, atendimento personalizado', journeyType: 'atendimento', buttonLabel: 'Agendar atendimento', benefits: ['Sessão de 1h30', 'Gravação pelo WhatsApp', 'PDF completo'], pdfTemplateKey: 'mapa' },
  { key: 'orientacao_vocacional_profissional', name: 'Orientação Vocacional e Profissional pela Numerologia', shortName: 'Carreira e realização', category: 'Carreira', group: 'Sessões Individuais', price: 'R$ 1.090', format: 'Sessão ao vivo pelo Zoom', delivery: 'Atendimento individual, gravação e PDF completo', description: 'Leitura do mapa com foco em carreira, profissão, talentos e caminhos de realização.', productType: 'Atendimento personalizado profissional', journeyType: 'atendimento', buttonLabel: 'Agendar atendimento', benefits: ['Sessão individual', 'Gravação', 'PDF completo'], pdfTemplateKey: 'mapa' },
  { key: 'sinastria_casal', name: 'Sinastria — Numerologia do Casal', shortName: 'Leitura do relacionamento', category: 'Relacionamentos', group: 'Sessões Individuais', price: 'R$ 1.180', format: 'Sessão ao vivo pelo Zoom com o casal', delivery: 'Atendimento e gravação pelo WhatsApp', description: 'Análise numerológica de duas pessoas, olhando afinidades, diferenças, comunicação e aprendizados.', productType: 'Atendimento personalizado para relacionamento', journeyType: 'atendimento', buttonLabel: 'Agendar atendimento', benefits: ['Sessão com o casal', 'Análise de afinidades', 'Gravação pelo WhatsApp'], pdfTemplateKey: 'mapa' },
  { key: 'mapa_crianca', name: 'Mapa de Criança', shortName: 'Compreensão dos filhos', category: 'Atendimento familiar', group: 'Família', price: 'R$ 910', format: 'Sessão ao vivo com os pais', delivery: 'Atendimento pelo Zoom, gravação por WhatsApp e PDF', description: 'Leitura para pais compreenderem essência, personalidade, talentos e desafios dos filhos.', productType: 'Atendimento personalizado familiar', journeyType: 'atendimento', buttonLabel: 'Agendar atendimento', benefits: ['Sessão com os pais', 'Gravação', 'PDF da criança'], pdfTemplateKey: 'mapa' },
  { key: 'mapa_adolescente', name: 'Mapa Numerológico de Adolescente', shortName: 'Identidade e direção', category: 'Atendimento familiar', group: 'Família', price: 'R$ 910', format: 'Sessão ao vivo pelo Zoom', delivery: 'Atendimento, gravação e PDF personalizado', description: 'Leitura para adolescentes e famílias, com foco em identidade, escolhas, talentos e direção de vida.', productType: 'Atendimento personalizado', journeyType: 'atendimento', buttonLabel: 'Agendar atendimento', benefits: ['Sessão ao vivo', 'Gravação', 'PDF personalizado'], pdfTemplateKey: 'mapa' },
  { key: 'nome_bebe', name: 'Análise de Nome de Bebê', shortName: 'Escolha consciente do nome', category: 'Família', group: 'Família', price: 'R$ 910', format: 'Análise personalizada assíncrona, sem Zoom', delivery: 'PDF personalizado + áudio explicativo pelo WhatsApp', description: 'Análise de opções de nomes e sobrenomes para apoiar a escolha do nome do bebê.', productType: 'Produto personalizado intermediário', journeyType: 'auto_contratacao', buttonLabel: 'Quero contratar', benefits: ['Comparação de nomes', 'PDF personalizado', 'Áudio explicativo'], pdfTemplateKey: 'mapa' },
  { key: 'data_cesarea', name: 'Análise de Data para Cesárea', shortName: 'Análise de datas autorizadas', category: 'Família', group: 'Família', price: 'R$ 630', format: 'Análise personalizada assíncrona', delivery: 'PDF + áudio explicativo pelo WhatsApp', description: 'Análise numerológica de datas já autorizadas pelo médico. A decisão médica sempre vem primeiro.', productType: 'Produto personalizado sensível', journeyType: 'auto_contratacao', buttonLabel: 'Quero contratar', benefits: ['Análise das datas autorizadas', 'PDF', 'Áudio explicativo'], pdfTemplateKey: 'mapa' },
  { key: 'abertura_empresa', name: 'Análise para Abertura de Empresa', shortName: 'Energia do negócio', category: 'Negócios', group: 'Negócios', price: 'R$ 910', format: 'Processo consultivo pelo WhatsApp', delivery: 'Análise, áudios explicativos e PDF final', description: 'Análise de nome, data de abertura, razão social ou nome fantasia para alinhar a energia do negócio.', productType: 'Produto personalizado empresarial', journeyType: 'auto_contratacao', buttonLabel: 'Quero contratar', benefits: ['Processo consultivo', 'Áudios explicativos', 'PDF final'], pdfTemplateKey: 'mapa' },
  { key: 'nome_profissional_marca', name: 'Análise de Nome Profissional e de Marca', shortName: 'Marca pessoal e projetos', category: 'Marca pessoal', group: 'Negócios', price: 'R$ 406', format: 'Análise personalizada assíncrona', delivery: 'PDF + áudio explicativo pelo WhatsApp', description: 'Análise de nome profissional, artístico, Instagram, marca pessoal ou projeto.', productType: 'Produto de entrada/intermediário', journeyType: 'auto_contratacao', buttonLabel: 'Quero contratar', benefits: ['Análise personalizada', 'PDF', 'Áudio explicativo'], pdfTemplateKey: 'mapa' },
  { key: 'mentoria_individual', name: 'Mentoria Individual', shortName: 'Jornada premium', category: 'Premium', group: 'Premium', price: 'R$ 3.970', format: '4 encontros individuais pelo Zoom', delivery: 'Sessões, PDF completo e suporte pelo WhatsApp', description: 'Jornada profunda com numerologia, autoconhecimento, padrões, propósito, relacionamentos e direcionamento de vida.', productType: 'Produto premium', journeyType: 'atendimento', buttonLabel: 'Agendar atendimento', benefits: ['4 encontros individuais', 'PDF completo', 'Suporte pelo WhatsApp'], pdfTemplateKey: 'mapa' },
];

export const getCatalogProduct = (productKey: string) => CATALOG_PRODUCTS.find((product) => product.key === productKey);
export const getPdfTemplateKey = (productKey: string): PdfProductKey => getCatalogProduct(productKey)?.pdfTemplateKey || (productKey === 'ano_pessoal' ? 'ano_pessoal' : 'mapa');
