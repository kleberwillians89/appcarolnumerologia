import { DEV_MODE } from '@/config/devMode';
import { hasSupabaseConfig } from '@/config/env';
import { supabase } from '@/lib/supabaseClient';
import { normalizeBrazilianPhone } from '@/utils/phoneUtils';
import { PdfProduct, PdfProductKey } from './pdfDeliveryService';

export type DeliveryStatus =
  | 'DADOS_RECEBIDOS'
  | 'AGUARDANDO_DADOS'
  | 'PRONTO_PARA_GERAR_PDF'
  | 'AGUARDANDO_ANALISE'
  | 'PDF_GERADO'
  | 'PDF_ENVIADO';

export interface Delivery {
  id: string;
  localId?: string;
  userId?: string | null;
  nome: string;
  telefone: string;
  telefoneNormalizado: string;
  email?: string;
  produto: PdfProductKey;
  tipoProduto?: string | null;
  status: DeliveryStatus;
  dataNascimento: string;
  linkPdf: string | null;
  pdfDataUrl?: string | null;
  fileName?: string | null;
  pdfStoragePath?: string | null;
  dataCriacao: string;
  dataEnvio: string | null;
  origem: 'mock' | 'plataforma' | 'site' | 'google_sheets';
  observacoesCliente: string;
  observacoesCarol: string;
  dadosNumerologicos?: any;
  dadosCliente?: any;
}

export interface SiteLeadPayload {
  nome: string;
  telefone: string;
  email?: string;
  produto: PdfProductKey;
  tipoProduto?: string | null;
  dataNascimento: string;
  userId?: string | null;
  origem?: 'site' | 'google_sheets' | 'plataforma';
  observacoesCliente?: string;
  observacoesCarol?: string;
  dadosNumerologicos?: any;
  dadosCliente?: any;
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

const normalizeStatus = (status: any): DeliveryStatus => {
  if (status === 'pdf_gerado') return 'PDF_GERADO';
  if (status === 'enviado') return 'PDF_ENVIADO';
  if (status === 'pendente') return 'DADOS_RECEBIDOS';
  if (
    status === 'DADOS_RECEBIDOS' ||
    status === 'AGUARDANDO_DADOS' ||
    status === 'PRONTO_PARA_GERAR_PDF' ||
    status === 'AGUARDANDO_ANALISE' ||
    status === 'PDF_GERADO' ||
    status === 'PDF_ENVIADO'
  ) {
    return status;
  }

  return 'DADOS_RECEBIDOS';
};

const normalizeProduct = (produto: any): PdfProductKey => {
  if (produto === 'ano_pessoal' || produto === 'Ano Pessoal') return 'ano_pessoal';
  return 'mapa';
};

export const mapDeliveryFromSupabase = (delivery: any): Delivery => ({
  id: delivery.id || delivery.localId || createLocalId(),
  localId: delivery.localId,
  userId: delivery.user_id || delivery.userId || null,
  nome: delivery.nome || delivery.name || 'Cliente',
  telefone: delivery.telefone || '',
  telefoneNormalizado: delivery.telefone_normalizado || delivery.telefoneNormalizado || normalizeBrazilianPhone(delivery.telefone || ''),
  email: delivery.email || '',
  produto: normalizeProduct(delivery.produto),
  tipoProduto: delivery.tipo_produto || delivery.tipoProduto || delivery.produto || null,
  status: normalizeStatus(delivery.status),
  dataNascimento: delivery.data_nascimento || delivery.dataNascimento || delivery.birthDate || '',
  linkPdf: delivery.link_pdf || delivery.linkPdf || null,
  pdfDataUrl: delivery.pdf_data_url || delivery.pdfDataUrl || null,
  fileName: delivery.file_name || delivery.fileName || null,
  pdfStoragePath: delivery.pdf_storage_path || delivery.pdfStoragePath || null,
  dataCriacao: delivery.data_criacao || delivery.dataCriacao || delivery.created_at || new Date().toISOString(),
  dataEnvio: delivery.data_envio || delivery.dataEnvio || null,
  origem: delivery.origem || 'mock',
  observacoesCliente: delivery.observacoes_cliente || delivery.observacoesCliente || '',
  observacoesCarol: delivery.observacoes_carol || delivery.observacoesCarol || '',
  dadosNumerologicos: delivery.dados_numerologicos || delivery.dadosNumerologicos,
  dadosCliente: delivery.dados_cliente || delivery.dadosCliente,
});

export const mapDeliveryToSupabase = (delivery: Partial<Delivery>) => {
  const payload: Record<string, any> = {};

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
  if ('dataNascimento' in delivery) payload.data_nascimento = delivery.dataNascimento;
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

const filterAllowedDeliveryColumns = (payload: Record<string, any>) => {
  const allowed = new Set<string>(DELIVERY_INSERT_UPDATE_COLUMNS);
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowed.has(key as DeliverySupabaseColumn))
  );
};

const compactDbPayload = (payload: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
};

const logSupabaseMutationError = (operation: string, payload: Record<string, any>, error: { message?: string; [key: string]: any }) => {
  console.error(`[deliveryService] Erro Supabase em ${operation}`, {
    payload,
    error,
  });
};

const hasMinimumCreateFields = (payload: Partial<Delivery>) => Boolean(
  payload.nome &&
  payload.telefone &&
  payload.produto &&
  payload.status &&
  payload.dataNascimento &&
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

const shouldUseLocalFallback = () => DEV_MODE || !hasSupabaseConfig || !supabase;

const hasActiveSupabaseSession = async () => {
  if (shouldUseLocalFallback()) return false;
  const { data, error } = await supabase!.auth.getSession();
  return Boolean(!error && data.session);
};

const getInitialStatus = (payload: SiteLeadPayload): DeliveryStatus => {
  return 'PRONTO_PARA_GERAR_PDF';
};

export const getProductLabel = (produto: PdfProductKey | PdfProduct) => {
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

    const { data, error } = await supabase!
      .from('deliveries')
      .select(DELIVERY_SELECT)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.warn('[deliveryService] Usando entregas locais apos erro no Supabase', error.message);
      return localDeliveryStore.listDeliveries();
    }
    return (data || []).map(mapDeliveryFromSupabase);
  },

  async fetchDeliveriesForCurrentUser(userId: string): Promise<Delivery[]> {
    if (!(await hasActiveSupabaseSession())) {
      return localDeliveryStore.listDeliveries().filter((delivery) => !delivery.userId || delivery.userId === userId);
    }

    const { data, error } = await supabase!
      .from('deliveries')
      .select(DELIVERY_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('[deliveryService] Usando entregas locais do usuario apos erro no Supabase', error.message);
      return localDeliveryStore.listDeliveries().filter((delivery) => !delivery.userId || delivery.userId === userId);
    }
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
    const { data, error } = await supabase!
      .from('deliveries')
      .insert(dbPayload)
      .select(DELIVERY_SELECT)
      .single();

    if (error) {
      logSupabaseMutationError('createDelivery', dbPayload, error);
      const localId = input.localId || input.id || createLocalId();
      return localDeliveryStore.upsertDelivery({
        ...delivery,
        id: localId,
        localId,
      });
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
    const { data, error } = await supabase!
      .from('deliveries')
      .update(dbPayload)
      .eq('id', id)
      .select(DELIVERY_SELECT)
      .single();

    if (error) {
      logSupabaseMutationError('updateDelivery', dbPayload, error);
      const existing = localDeliveryStore.listDeliveries().find((delivery) => delivery.id === id);
      if (!existing) throw new Error('Entrega não encontrada.');
      return localDeliveryStore.upsertDelivery({ ...existing, ...payload, id });
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
    pdf: { linkPdf?: string | null; pdfDataUrl?: string | null; fileName?: string | null; pdfStoragePath?: string | null }
  ): Promise<Delivery> {
    const id = typeof deliveryOrId === 'string' ? deliveryOrId : deliveryOrId.id;
    const base = typeof deliveryOrId === 'string' ? undefined : deliveryOrId;
    const payload: Partial<Delivery> = {
      ...(base || {}),
      status: 'PDF_GERADO',
      linkPdf: pdf.linkPdf || base?.linkPdf || null,
      pdfDataUrl: pdf.pdfDataUrl ?? base?.pdfDataUrl ?? null,
      fileName: pdf.fileName || base?.fileName || null,
      pdfStoragePath: pdf.pdfStoragePath || base?.pdfStoragePath || null,
      telefoneNormalizado: base?.telefoneNormalizado || normalizeBrazilianPhone(base?.telefone || ''),
    };

    return this.updateDelivery(id, payload);
  },

  async updateDeliveryStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    return this.updateDelivery(id, { status });
  },

  async markDeliveryAsSent(deliveryOrId: Delivery | string, dataEnvio = new Date().toISOString()): Promise<Delivery> {
    const id = typeof deliveryOrId === 'string' ? deliveryOrId : deliveryOrId.id;
    return this.updateDelivery(id, {
      status: 'PDF_ENVIADO',
      dataEnvio,
    });
  },
};
