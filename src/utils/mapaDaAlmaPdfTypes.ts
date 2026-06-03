// Tipos para o gerador de PDF "Mapa da Alma"

export interface NumeroItem {
  titulo: string;
  numero: string;
  resumo?: string;
  texto: string;
  icone?: string;
}

export interface AnoPessoalData {
  numero: string;
  interpretacaoCompleta: string;
  timeline: Array<{ idx: number; label: string; destaque?: boolean }>;
}

export interface CalendarioAnoPessoal {
  periodoLabel: string;
  meses: Array<{ mesAno: string; texto: string }>;
  oportunidades: string[];
  temasPrincipais: string[];
  desafios: string[];
}

export interface CicloData {
  numero: string;
  titulo: string;
  texto: string;
  faixa: string;
}

export interface DesafiosCiclicosData {
  intro: string;
  des1: { numero: string; texto: string; faixa: string };
  des2: { numero: string; texto: string; faixa: string };
  desafioMaior: { numero: string; texto: string };
}

export interface PresentesData {
  intro: string;
  p1: { numero: string; texto: string; faixa: string };
  p2: { numero: string; texto: string; faixa: string };
  p3: { numero: string; texto: string; faixa: string };
  p4: { numero: string; texto: string; faixa: string };
}

export interface CompatibilidadeData {
  percentualGeral: number;
  conexaoAlma: { pct: number; tituloHarmonia: string; tituloDesafio: string; texto: string };
  alinhamentoDestino: { pct: number; texto: string };
  sinergiaTalentos: { pct: number; texto: string };
  faseDaVida: { pct: number; texto: string };
  comparacaoPerfis: Array<{
    nome: string;
    alma: string;
    destino: string;
    talento: string;
    ciclo: string;
    destaque?: boolean;
  }>;
}

export interface MapaDaAlmaInput {
  capa: { nome: string; dataNascimento: string };
  numeros: NumeroItem[];
  anoPessoal: AnoPessoalData;
  calendario: CalendarioAnoPessoal;
  ciclos: [CicloData, CicloData, CicloData];
  desafios: DesafiosCiclicosData;
  presentes: PresentesData;
  compatibilidade?: CompatibilidadeData;
}
