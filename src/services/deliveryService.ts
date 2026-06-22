import { DEV_MODE } from '@/config/devMode';
import { demoMode, hasSupabaseConfig } from '@/config/env';
import { supabase } from '@/lib/supabaseClient';
import { normalizeBrazilianPhone } from '@/utils/phoneUtils';
import { PdfGenerationInput, PdfProduct, PdfProductKey } from './pdfDeliveryService';
import { getCatalogProduct } from '@/config/catalogProducts';

type JsonRecord = Record<string, unknown>;

export type DeliveryStatus =
  | 'PEDIDO_CRIADO'
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGAMENTO_CONFIRMADO'
  | 'DADOS_RECEBIDOS'
  | 'AGUARDANDO_DADOS'
  | 'PDF_DEMO_GERADO'
  | 'PDF_GERADO'
  | 'PDF_ENVIADO'
  | 'FINALIZADO';

export interface Delivery {
  id: string;
  localId?: string;
  userId?: string | null;
  nome: string;
  telefone: string;
  telefoneNormalizado: string;
  email?: string;
  produto: PdfProductKey | string;
  tipoProduto?: string | null;
  status: DeliveryStatus;
  dataNascimento: string | null;
  linkPdf: string | null;
  pdfDataUrl?: string | null;
  fileName?: string | null;
  pdfStoragePath?: string | null;
  dataCriacao: string;
  dataEnvio: string | null;
  origem: 'mock' | 'plataforma' | 'site' | 'google_sheets';
  observacoesCliente: string;
  observacoesCarol: string;
  dadosNumerologicos?: PdfGenerationInput['dadosNumerologicos'];
  dadosCliente?: JsonRecord;
}

export interface SiteLeadPayload {
  nome: string;
  telefone: string;
  email?: string;
  produto: PdfProductKey | string;
  tipoProduto?: string | null;
  dataNascimento: string | null;
  userId?: string | null;
  origem?: 'site' | 'google_sheets' | 'plataforma';
  observacoesCliente?: string;
  observacoesCarol?: string;
  dadosNumerologicos?: PdfGenerationInput['dadosNumerologicos'];
  dadosCliente?: JsonRecord;
}

export type DeliveryCreateInput = Omit<Delivery, 'id' | 'dataCriacao' | 'dataEnvio' | 'telefoneNormalizado'> &
  Partial<Pick<Delivery, 'id' | 'dataCriacao' | 'dataEnvio' | 'telefoneNormalizado'>>;

const STORAGE_KEY = 'carol_deliveries';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DELIVERY_SELECT = [
  'id',
  'user_id',
  'nome',
  'telefone',
  'telefone_normalizado',
  'email',
  'produto',
  'tipo_produto',
  'data_nascimento',
  'status',
  'origem',
  'observacoes_cliente',
  'observacoes_carol',
  'link_pdf',
  'pdf_data_url',
  'file_name',
  'pdf_storage_path',
  'data_criacao',
  'data_envio',
  'created_at',
  'updated_at',
  'dados_numerologicos',
  'dados_cliente',
].join(',');

const DELIVERY_INSERT_UPDATE_COLUMNS = [
  'user_id',
  'nome',
  'telefone',
  'telefone_normalizado',
  'email',
  'produto',
  'tipo_produto',
  'data_nascimento',
  'status',
  'origem',
  'observacoes_cliente',
  'observacoes_carol',
  'link_pdf',
  'pdf_data_url',
  'pdf_storage_path',
  'file_name',
  'dados_cliente',
  'dados_numerologicos',
  'data_criacao',
  'data_envio',
] as const;

type DeliverySupabaseColumn = typeof DELIVERY_INSERT_UPDATE_COLUMNS[number];

export const isValidUuid = (value?: string | null) => Boolean(value && UUID_REGEX.test(value));

const createLocalId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `local-delivery-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const mockDeliveries: Delivery[] = [
  {
    id: 'DEL-001',
    userId: null,
    nome: 'Ana Beatriz Lima',
    telefone: '(11) 99999-1111',
    telefoneNormalizado: '5511999991111',
    email: 'ana.beatriz@email.com',
    produto: 'mapa',
    status: 'PDF_GERADO',
    dataNascimento: '1988-04-12',
    linkPdf: 'local://mapa-da-alma-ana-beatriz-lima.pdf',
    pdfDataUrl: null,
    fileName: 'mapa-da-alma-ana-beatriz-lima.pdf',
    pdfStoragePath: null,
    dataCriacao: '2026-06-01T10:30:00.000Z',
    dataEnvio: null,
    origem: 'mock',
    observacoesCliente: 'Cliente pediu envio pelo WhatsApp.',
    observacoesCarol: '',
  },
  {
    id: 'DEL-002',
    userId: null,
    nome: 'Marina Torres',
    telefone: '(11) 98888-2222',
    telefoneNormalizado: '5511988882222',
    email: 'marina.torres@email.com',
    produto: 'ano_pessoal',
    status: 'DADOS_RECEBIDOS',
    dataNascimento: '1991-11-03',
    linkPdf: null,
    pdfDataUrl: null,
    fileName: null,
    pdfStoragePath: null,
    dataCriacao: '2026-06-01T14:10:00.000Z',
    dataEnvio: null,
    origem: 'mock',
    observacoesCliente: 'Produto comprado no site externo.',
    observacoesCarol: '',
  },
  {
    id: 'DEL-003',
    userId: null,
    nome: 'Claudia Martins',
    telefone: '(21) 99999-3333',
    telefoneNormalizado: '5521999993333',
    email: 'claudia.martins@email.com',
    produto: 'mapa',
    status: 'PDF_ENVIADO',
    dataNascimento: '1979-08-28',
    linkPdf: 'local://mapa-da-alma-claudia-martins.pdf',
    pdfDataUrl: null,
    fileName: 'mapa-da-alma-claudia-martins.pdf',
    pdfStoragePath: null,
    dataCriacao: '2026-05-31T16:45:00.000Z',
    dataEnvio: '2026-06-01T09:20:00.000Z',
    origem: 'mock',
    observacoesCliente: '',
    observacoesCarol: 'Enviado manualmente no lote de teste.',
  },
];

const isBrowser = () => typeof window !== 'undefined';

export const normalizeStatus = (status: unknown): DeliveryStatus => {
  if (status === 'PEDIDO_CRIADO' || status === 'pedido_criado') return 'PEDIDO_CRIADO';
  if (status === 'AGUARDANDO_PAGAMENTO' || status === 'aguardando_pagamento') return 'AGUARDANDO_PAGAMENTO';
  if (status === 'PAGAMENTO_CONFIRMADO' || status === 'PAGO' || status === 'pago') return 'PAGAMENTO_CONFIRMADO';
  if (status === 'AGUARDANDO_DADOS') return 'AGUARDANDO_DADOS';
  if (status === 'DADOS_RECEBIDOS' || status === 'PRONTO_PARA_GERAR_PDF' || status === 'AGUARDANDO_ANALISE') return 'DADOS_RECEBIDOS';
  if (status === 'PDF_DEMO_GERADO' || status === 'pdf_demo_gerado') return 'PDF_DEMO_GERADO';
  if (status === 'pdf_gerado') return 'PDF_GERADO';
  if (status === 'enviado') return 'PDF_ENVIADO';
  if (status === 'pendente') return 'DADOS_RECEBIDOS';
  if (
    status === 'PDF_GERADO' ||
    status === 'PDF_ENVIADO' ||
    status === 'FINALIZADO'
  ) {
    return status;
  }

  return 'DADOS_RECEBIDOS';
};

const normalizeProduct = (produto: unknown): PdfProductKey | string => {
  if (produto === 'ano_pessoal' || produto === 'Ano Pessoal') return 'ano_pessoal';
  if (produto === 'mapa' || produto === 'Mapa da Alma') return 'mapa';
  if (typeof produto === 'string' && produto.trim()) return produto;
  return 'mapa';
};

const readValue = (row: JsonRecord, ...keys: string[]) => keys.map((key) => row[key]).find((value) => value !== undefined && value !== null);
const readString = (row: JsonRecord, ...keys: string[]) => {
  const value = readValue(row, ...keys);
  return typeof value === 'string' ? value : '';
};
const readJson = <T,>(row: JsonRecord, ...keys: string[]) => {
  const value = readValue(row, ...keys);
  return value && typeof value === 'object' && !Array.isArray(value) ? value as T : undefined;
};

export const mapDeliveryFromSupabase = (delivery: JsonRecord): Delivery => {
  const telefone = readString(delivery, 'telefone');
  return {
    id: readString(delivery, 'id', 'localId') || createLocalId(),
    localId: readString(delivery, 'localId') || undefined,
    userId: readString(delivery, 'user_id', 'userId') || null,
    nome: readString(delivery, 'nome', 'name') || 'Cliente',
    telefone,
    telefoneNormalizado: readString(delivery, 'telefone_normalizado', 'telefoneNormalizado') || normalizeBrazilianPhone(telefone),
    email: readString(delivery, 'email'),
    produto: normalizeProduct(readValue(delivery, 'produto')),
    tipoProduto: readString(delivery, 'tipo_produto', 'tipoProduto', 'produto') || null,
    status: normalizeStatus(readValue(delivery, 'status')),
    dataNascimento: readString(delivery, 'data_nascimento', 'dataNascimento', 'birthDate') || null,
    linkPdf: readString(delivery, 'link_pdf', 'linkPdf') || null,
    pdfDataUrl: readString(delivery, 'pdf_data_url', 'pdfDataUrl') || null,
    fileName: readString(delivery, 'file_name', 'fileName') || null,
    pdfStoragePath: readString(delivery, 'pdf_storage_path', 'pdfStoragePath') || null,
    dataCriacao: readString(delivery, 'data_criacao', 'dataCriacao', 'created_at') || new Date().toISOString(),
    dataEnvio: readString(delivery, 'data_envio', 'dataEnvio') || null,
    origem: (readString(delivery, 'origem') as Delivery['origem']) || 'mock',
    observacoesCliente: readString(delivery, 'observacoes_cliente', 'observacoesCliente'),
    observacoesCarol: readString(delivery, 'observacoes_carol', 'observacoesCarol'),
    dadosNumerologicos: readJson<PdfGenerationInput['dadosNumerologicos']>(delivery, 'dados_numerologicos', 'dadosNumerologicos'),
    dadosCliente: readJson<JsonRecord>(delivery, 'dados_cliente', 'dadosCliente'),
  };
};

export const mapDeliveryToSupabase = (delivery: Partial<Delivery>) => {
  const payload: JsonRecord = {};

  if ('userId' in delivery && isValidUuid(delivery.userId)) payload.user_id = delivery.userId;
  if ('nome' in delivery) payload.nome = delivery.nome;
  if ('telefone' in delivery) payload.telefone = delivery.telefone;
  if ('telefoneNormalizado' in delivery || 'telefone' in delivery) {
    payload.telefone_normalizado = delivery.telefoneNormalizado || normalizeBrazilianPhone(delivery.telefone || '');
  }
  if ('email' in delivery) payload.email = delivery.email || null;
  if ('produto' in delivery) payload.produto = delivery.produto;
  if ('tipoProduto' in delivery || 'produto' in delivery) payload.tipo_produto = delivery.tipoProduto || delivery.produto || null;
  if ('status' in delivery) payload.status = delivery.status;
  if ('dataNascimento' in delivery) payload.data_nascimento = delivery.dataNascimento || null;
  if ('linkPdf' in delivery) payload.link_pdf = delivery.linkPdf || null;
  if ('pdfDataUrl' in delivery) payload.pdf_data_url = delivery.pdfDataUrl || null;
  if ('fileName' in delivery) payload.file_name = delivery.fileName || null;
  if ('pdfStoragePath' in delivery) payload.pdf_storage_path = delivery.pdfStoragePath || null;
  if ('dataCriacao' in delivery) payload.data_criacao = delivery.dataCriacao;
  if ('dataEnvio' in delivery) payload.data_envio = delivery.dataEnvio || null;
  if ('origem' in delivery) payload.origem = delivery.origem;
  if ('observacoesCliente' in delivery) payload.observacoes_cliente = delivery.observacoesCliente || '';
  if ('observacoesCarol' in delivery) payload.observacoes_carol = delivery.observacoesCarol || '';
  if ('dadosNumerologicos' in delivery) payload.dados_numerologicos = delivery.dadosNumerologicos || null;
  if ('dadosCliente' in delivery) payload.dados_cliente = delivery.dadosCliente || null;

  return compactDbPayload(filterAllowedDeliveryColumns(payload));
};

const filterAllowedDeliveryColumns = (payload: JsonRecord) => {
  const allowed = new Set<string>(DELIVERY_INSERT_UPDATE_COLUMNS);
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowed.has(key as DeliverySupabaseColumn))
  );
};

const compactDbPayload = (payload: JsonRecord) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
};

const normalizeEmptyDateValues = (record?: JsonRecord): JsonRecord | undefined => {
  if (!record) return record;
  return Object.fromEntries(Object.entries(record).map(([key, value]) => {
    const looksLikeDate = /data|nascimento/i.test(key);
    return [key, looksLikeDate && value === '' ? null : value];
  }));
};

const logSupabaseMutationError = (operation: string, payload: JsonRecord, error: { message?: string } & JsonRecord) => {
  console.error(`[deliveryService] Erro Supabase em ${operation}`, {
    payload,
    error,
  });
};

const hasMinimumCreateFields = (payload: Partial<Delivery>) => Boolean(
  payload.nome &&
  payload.produto &&
  payload.status &&
  payload.origem
);

const readStoredDeliveries = (): Delivery[] | null => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).map(mapDeliveryFromSupabase) : null;
  } catch {
    return null;
  }
};

const writeStoredDeliveries = (deliveries: Delivery[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
  window.dispatchEvent(new CustomEvent('deliveriesUpdated'));
};

const shouldUseLocalFallback = () => DEV_MODE || demoMode;

const requireSupabase = () => {
  if (!supabase || !hasSupabaseConfig) {
    throw new Error('Supabase não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

const hasActiveSupabaseSession = async () => {
  if (shouldUseLocalFallback()) return false;
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw new Error(`Não foi possível validar a sessão: ${error.message}`);
  if (!data.session) throw new Error('Sessão expirada. Entre novamente para continuar.');
  return true;
};

const getInitialStatus = (payload: SiteLeadPayload): DeliveryStatus => {
  return 'DADOS_RECEBIDOS';
};

export const getProductLabel = (produto: PdfProductKey | PdfProduct | string) => {
  const catalogProduct = getCatalogProduct(produto);
  if (catalogProduct) return catalogProduct.name;
  if (produto === 'desvende_mapa') return 'Desvende seu Mapa';
  if (produto === 'nome_profissional_marca') return 'Nome Profissional/Marca';
  if (produto === 'data_cesarea') return 'Data para Cesárea';
  if (produto === 'nome_bebe') return 'Nome do Bebê';
  if (produto === 'abertura_empresa') return 'Abertura de Empresa';
  if (produto === 'mapa') return 'Mapa da Alma';
  if (produto === 'ano_pessoal') return 'Ano Pessoal';
  return 'Produto';
};

const localDeliveryStore = {
  listDeliveries(): Delivery[] {
    const stored = readStoredDeliveries();
    if (stored) return stored;
    writeStoredDeliveries(mockDeliveries);
    return mockDeliveries;
  },

  saveDeliveries(deliveries: Delivery[]) {
    writeStoredDeliveries(deliveries);
    return deliveries;
  },

  upsertDelivery(delivery: Delivery): Delivery {
    const deliveries = this.listDeliveries();
    const exists = deliveries.some((item) => item.id === delivery.id);
    const next = exists
      ? deliveries.map((item) => (item.id === delivery.id ? delivery : item))
      : [delivery, ...deliveries];
    writeStoredDeliveries(next);
    return delivery;
  },
};

export const deliveryService = {
  listDeliveries(): Delivery[] {
    return localDeliveryStore.listDeliveries();
  },

  async fetchDeliveriesForAdmin(): Promise<Delivery[]> {
    if (!(await hasActiveSupabaseSession())) return localDeliveryStore.listDeliveries();

    const { data, error } = await requireSupabase()
      .from('deliveries')
      .select(DELIVERY_SELECT)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw new Error(`Não foi possível carregar os pedidos no Supabase: ${error.message}`);
    return (data || []).map(mapDeliveryFromSupabase);
  },

  async fetchDeliveriesForCurrentUser(userId: string): Promise<Delivery[]> {
    if (!(await hasActiveSupabaseSession())) {
      return localDeliveryStore.listDeliveries().filter((delivery) => delivery.userId === userId);
    }

    const { data, error } = await requireSupabase()
      .from('deliveries')
      .select(DELIVERY_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(`Não foi possível carregar sua área no Supabase: ${error.message}`);
    return (data || []).map(mapDeliveryFromSupabase);
  },

  async upsertDelivery(delivery: Delivery): Promise<Delivery> {
    if (!(await hasActiveSupabaseSession())) return localDeliveryStore.upsertDelivery(delivery);

    if (isValidUuid(delivery.id)) {
      return this.updateDelivery(delivery.id, delivery);
    }

    return this.createDelivery(delivery);
  },

  async createDelivery(input: DeliveryCreateInput): Promise<Delivery> {
    const delivery = {
      ...input,
      dataNascimento: input.dataNascimento || null,
      dadosCliente: normalizeEmptyDateValues(input.dadosCliente),
      dataCriacao: input.dataCriacao || new Date().toISOString(),
      dataEnvio: input.dataEnvio || null,
      telefoneNormalizado: input.telefoneNormalizado || normalizeBrazilianPhone(input.telefone),
    };

    if (!(await hasActiveSupabaseSession())) {
      const localId = input.localId || input.id || createLocalId();
      return localDeliveryStore.upsertDelivery({
        ...delivery,
        id: localId,
        localId,
      });
    }

    const dbPayload = mapDeliveryToSupabase(delivery);
    const { data, error } = await requireSupabase()
      .from('deliveries')
      .insert(dbPayload)
      .select(DELIVERY_SELECT)
      .single();

    if (error) {
      logSupabaseMutationError('createDelivery', dbPayload, error);
      throw new Error(`O pedido não foi salvo no Supabase: ${error.message}`);
    }

    return mapDeliveryFromSupabase(data);
  },

  async updateDelivery(id: string, payload: Partial<Delivery>): Promise<Delivery> {
    if (!(await hasActiveSupabaseSession())) {
      const existing = localDeliveryStore.listDeliveries().find((delivery) => delivery.id === id);
      if (!existing) throw new Error('Entrega não encontrada.');
      return localDeliveryStore.upsertDelivery({ ...existing, ...payload, id });
    }

    if (!isValidUuid(id)) {
      console.warn('[deliveryService] Tentativa de atualizar entrega sem UUID real', { id, payload });
      if (hasMinimumCreateFields(payload)) {
        return this.createDelivery(payload as DeliveryCreateInput);
      }
      throw new Error('Essa entrega ainda não tem um ID real do Supabase. Crie a entrega antes de atualizar.');
    }

    const dbPayload = mapDeliveryToSupabase(payload);
    const { data, error } = await requireSupabase()
      .from('deliveries')
      .update(dbPayload)
      .eq('id', id)
      .select(DELIVERY_SELECT)
      .single();

    if (error) {
      logSupabaseMutationError('updateDelivery', dbPayload, error);
      throw new Error(`A atualização não foi salva no Supabase: ${error.message}`);
    }
    return mapDeliveryFromSupabase(data);
  },

  async createDeliveryFromSiteLead(payload: SiteLeadPayload): Promise<Delivery> {
    return this.createDelivery({
      userId: payload.userId || null,
      nome: payload.nome,
      telefone: payload.telefone || '',
      telefoneNormalizado: normalizeBrazilianPhone(payload.telefone || ''),
      email: payload.email || '',
      produto: payload.produto,
      status: getInitialStatus(payload),
      dataNascimento: payload.dataNascimento,
      linkPdf: null,
      pdfDataUrl: null,
      fileName: null,
      pdfStoragePath: null,
      origem: payload.origem || 'site',
      observacoesCliente: payload.observacoesCliente || '',
      observacoesCarol: payload.observacoesCarol || '',
      dadosNumerologicos: payload.dadosNumerologicos,
      dadosCliente: payload.dadosCliente || {
        nome: payload.nome,
        telefone: payload.telefone,
        email: payload.email || '',
        dataNascimento: payload.dataNascimento,
        produto: payload.produto,
        origem: payload.origem || 'site',
      },
    });
  },

  async updateDeliveryPdf(
    deliveryOrId: Delivery | string,
    pdf: { linkPdf?: string | null; pdfDataUrl?: string | null; fileName?: string | null; pdfStoragePath?: string | null; demo?: boolean }
  ): Promise<Delivery> {
    const id = typeof deliveryOrId === 'string' ? deliveryOrId : deliveryOrId.id;
    const base = typeof deliveryOrId === 'string' ? undefined : deliveryOrId;
    const payload: Partial<Delivery> = {
      ...(base || {}),
      status: pdf.demo ? 'PDF_DEMO_GERADO' : 'PDF_GERADO',
      linkPdf: pdf.linkPdf || base?.linkPdf || null,
      pdfDataUrl: pdf.pdfDataUrl ?? base?.pdfDataUrl ?? null,
      fileName: pdf.fileName || base?.fileName || null,
      pdfStoragePath: pdf.pdfStoragePath || base?.pdfStoragePath || null,
      telefoneNormalizado: base?.telefoneNormalizado || normalizeBrazilianPhone(base?.telefone || ''),
      dadosCliente: {
        ...(base?.dadosCliente || {}),
        pdfKind: pdf.demo ? 'demo' : 'real',
      },
    };

    return this.updateDelivery(id, payload);
  },

  async updateDeliveryStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    return this.updateDelivery(id, { status });
  },

  async submitCustomerData(
    id: string,
    payload: Pick<Delivery, 'nome' | 'telefone' | 'telefoneNormalizado' | 'email' | 'dataNascimento' | 'observacoesCliente' | 'dadosCliente'>,
  ): Promise<Delivery> {
    if (!(await hasActiveSupabaseSession())) {
      return this.updateDelivery(id, { ...payload, status: 'DADOS_RECEBIDOS' });
    }

    const { data, error } = await requireSupabase().rpc('submit_customer_delivery_data', {
      p_delivery_id: id,
      p_nome: payload.nome,
      p_telefone: payload.telefone,
      p_telefone_normalizado: payload.telefoneNormalizado,
      p_email: payload.email || null,
      p_data_nascimento: payload.dataNascimento,
      p_observacoes_cliente: payload.observacoesCliente || '',
      p_dados_cliente: payload.dadosCliente || {},
    });

    if (error) throw new Error(`Os dados não foram salvos no Supabase: ${error.message}`);
    const record = Array.isArray(data) ? data[0] : data;
    if (!record) throw new Error('O Supabase não retornou o pedido atualizado.');
    return mapDeliveryFromSupabase(record);
  },

  async markDeliveryAsSent(deliveryOrId: Delivery | string, dataEnvio = new Date().toISOString()): Promise<Delivery> {
    const id = typeof deliveryOrId === 'string' ? deliveryOrId : deliveryOrId.id;
    return this.updateDelivery(id, {
      status: 'PDF_ENVIADO',
      dataEnvio,
    });
  },
};
