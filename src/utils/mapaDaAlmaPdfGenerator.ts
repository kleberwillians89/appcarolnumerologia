import jsPDF from 'jspdf';
import { NumerologyResult } from './numerologyCalculations';
import {
  calculateLifeCycles,
  calculateChallenges,
  calculatePresents,
} from './numerologyCalculations2';

import {
  soulNumberInterpretations,
  destinyNumberInterpretations,
  domNumberInterpretations,
  talentNumberInterpretations,
  dreamNumberInterpretations,
  challengeNumberInterpretations,
} from '../texts';
import { presentNumberInterpretations } from '../texts/presents';
import { personalYearInterpretations } from '../texts/personalYear';
import { lifeCycleGeneralMeanings } from '../texts/lifeCycles';

import {
  MapaDaAlmaInput,
  NumeroItem,
  AnoPessoalData,
  CalendarioAnoPessoal,
  CicloData,
  DesafiosCiclicosData,
  PresentesData,
  CompatibilidadeData,
} from './mapaDaAlmaPdfTypes';

import { renderCapaPage } from './mapaDaAlmaPdfPage1';
import { renderNumerosPageA } from './mapaDaAlmaPdfPage2A';
import { renderNumerosPageB } from './mapaDaAlmaPdfPage2B';

import { renderAnoPessoalPage } from './mapaDaAlmaPdfPage3';
import { renderCalendarioPage } from './mapaDaAlmaPdfPage4';
import { renderJornadaPage } from './mapaDaAlmaPdfPage5';
import { renderCiclosPage } from './mapaDaAlmaPdfPage6';
import { renderDesafiosPage } from './mapaDaAlmaPdfPage7';
import { renderPresentesPage } from './mapaDaAlmaPdfPage8';
import { renderCompatibilidadePage, hasCompatibilityData } from './mapaDaAlmaPdfPage9';
import { createFriendlyFileName, formatDatePtBr, setPremiumPdfMeta } from './mapaDaAlmaPdfHelpers';
import { formatDateBR } from './dateUtils';


interface MapaDaAlmaData {
  numerology?: {
    results: NumerologyResult;
    name: string;
    birthDate: string; // YYYY-MM-DD
  };
  personalYear?: {
    year: number;
    birthMonth: number;
    day: string;   // '11'
    month: string; // '08'
  };
  compatibility?: CompatibilidadeData | null;
}

const prepareMapaData = (data: MapaDaAlmaData): MapaDaAlmaInput | null => {
  if (!data.numerology) {
    console.error('❌ Erro: Dados de numerologia não disponíveis');
    return null;
  }

  const { results, name, birthDate } = data.numerology;

  if (!name || !birthDate) {
    throw new Error('Nome e data de nascimento são obrigatórios');
  }

  const [year, month, day] = birthDate.split('-').map(Number);
  if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error('Data de nascimento inválida. Use o formato YYYY-MM-DD');
  }

  const formattedDate = formatDateBR(birthDate);


  const numeros: NumeroItem[] = [
    {
      titulo: 'Número da Alma',
      numero: results.soul.toString(),
      texto: soulNumberInterpretations[results.soul]?.description || '',
    },
    {
      titulo: 'Número do Dom',
      numero: results.dom.toString(),
      texto: domNumberInterpretations[results.dom]?.description || '',
    },
    {
      titulo: 'Número do Destino',
      numero: results.destiny.toString(),
      texto: destinyNumberInterpretations[results.destiny]?.description || '',
    },
    {
      titulo: 'Número do Talento',
      numero: results.talent.toString(),
      texto: talentNumberInterpretations[results.talent]?.description || '',
    },
    {
      titulo: 'Número do Sonho',
      numero: results.dream.toString(),
      texto: dreamNumberInterpretations[results.dream]?.description || '',
    },
  ];

  const challenges = calculateChallenges(day, month, year);
  numeros.push({
    titulo: 'Desafio Maior',
    numero: challenges.major.value.toString(),
    texto: challengeNumberInterpretations[challenges.major.value]?.description || '',
  });

  const lifeCycles = calculateLifeCycles(day, month, year);
  const ciclos: [CicloData, CicloData, CicloData] = [
    {
      numero: lifeCycles.first.value.toString(),
      titulo: lifeCycleGeneralMeanings[lifeCycles.first.value]?.title || '',
      texto: lifeCycleGeneralMeanings[lifeCycles.first.value]?.description || '',
      faixa: '0-28 anos',
    },
    {
      numero: lifeCycles.second.value.toString(),
      titulo: lifeCycleGeneralMeanings[lifeCycles.second.value]?.title || '',
      texto: lifeCycleGeneralMeanings[lifeCycles.second.value]?.description || '',
      faixa: '29-56 anos',
    },
    {
      numero: lifeCycles.third.value.toString(),
      titulo: lifeCycleGeneralMeanings[lifeCycles.third.value]?.title || '',
      texto: lifeCycleGeneralMeanings[lifeCycles.third.value]?.description || '',
      faixa: '57+ anos',
    },
  ];

  const desafios: DesafiosCiclicosData = {
    intro:
      'Além de um grande aprendizado durante toda nossa vida, representado pelo Desafio Maior, existem também dois desafios cíclicos. Um deles na fase formativa e outro na fase produtiva.',
    des1: {
      numero: challenges.first.value.toString(),
      texto: challengeNumberInterpretations[challenges.first.value]?.description || '',
      faixa: '0-28 anos',
    },
    des2: {
      numero: challenges.second.value.toString(),
      texto: challengeNumberInterpretations[challenges.second.value]?.description || '',
      faixa: '29-56 anos',
    },
    desafioMaior: {
      numero: challenges.major.value.toString(),
      texto: challengeNumberInterpretations[challenges.major.value]?.description || '',
    },
  };

  // Ano Pessoal
  const pyYear = data.personalYear?.year || 1;
  const anoPessoal: AnoPessoalData = {
    numero: pyYear.toString(),
    interpretacaoCompleta: personalYearInterpretations[pyYear]?.description || '',
    timeline: Array.from({ length: 9 }, (_, i) => ({
      idx: i + 1,
      label: ['Início', 'Cooperação', 'Expansão', 'Estrutura', 'Mudança', 'Harmonia', 'Reflexão', 'Colheita', 'Finalização'][i],
      destaque: i + 1 === pyYear,
    })),
  };

  // Calendário (organizado para iniciar no mês do aniversário do ciclo atual)
  const startMonth = Number(data.personalYear?.birthMonth ?? month); // mês de nascimento
  const currentMonth = new Date().getMonth() + 1; // mês atual (1-12)
  const currentYear = new Date().getFullYear();
  
  // Se já passou o aniversário este ano, o ciclo atual começou neste ano
  // Se ainda não chegou, o ciclo atual começou no ano passado
  const startYear = currentMonth >= startMonth ? currentYear : currentYear - 1;
  
  const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const dicas = [
    'Mês perfeito para iniciar projetos.',
    'Foque em parcerias.',
    'Comunique suas ideias.',
    'Organize os detalhes.',
    'Esteja aberto a mudanças.',
    'Equilibre trabalho e família.',
    'Reflita sobre o progresso.',
    'Questões financeiras.',
    'Finalize pendências.',
    'Celebre conquistas.',
    'Intuição elevada.',
    'Encerre com gratidão.',
  ];

  const meses: CalendarioAnoPessoal['meses'] = Array.from({ length: 12 }, (_, i) => {
    const m = ((startMonth - 1 + i) % 12); // índice do mês (0-11)
    const ano = startYear + Math.floor((startMonth - 1 + i) / 12);
    const label = `${mesesNomes[m]} / ${ano}`;
    return { mesAno: label, texto: dicas[m] };
  });


  const calendario: CalendarioAnoPessoal = {
    periodoLabel: `Ano Pessoal ${pyYear}`,
    meses,
    oportunidades: ['Iniciar projetos', 'Desenvolver liderança', 'Afirmar independência'],
    temasPrincipais: ['Novos começos', 'Independência', 'Coragem'],
    desafios: ['Evitar egoísmo', 'Não agir por impulso', 'Aceitar ajuda'],
  };

  return {
    capa: { nome: name, dataNascimento: formattedDate },

    numeros,
    anoPessoal,
    calendario,
    ciclos,
    desafios,
    presentes: (() => {
      const presents = calculatePresents(day, month, year);
      const p: PresentesData = {
        intro:
          'São momentos de realizações, momentos positivos, de pura conquista. São presentes, ou melhor dizendo, dádivas que a vida lhe dá e você deve sentir somente na vibração positiva do número.',
        p1: {
          numero: presents.first.value.toString(),
          texto: presentNumberInterpretations[presents.first.value]?.description || '',
          faixa: '0-29 anos',
        },
        p2: {
          numero: presents.second.value.toString(),
          texto: presentNumberInterpretations[presents.second.value]?.description || '',
          faixa: '30-39 anos',
        },
        p3: {
          numero: presents.third.value.toString(),
          texto: presentNumberInterpretations[presents.third.value]?.description || '',
          faixa: '40-49 anos',
        },
        p4: {
          numero: presents.fourth.value.toString(),
          texto: presentNumberInterpretations[presents.fourth.value]?.description || '',
          faixa: '50+ anos',
        },
      };
      return p;
    })(),
    // compatibilidade é tratada fora (página condicional)
  };
};

export const generateMapaDaAlmaPDF = async (data: MapaDaAlmaData, previewMode = false) => {
  try {
    const mapaData = prepareMapaData(data);
    if (!mapaData) return null;

    const pdf = new jsPDF('p', 'pt', 'a4');
    const dataEmissao = formatDatePtBr();
    const productName = 'Mapa da Alma';

    setPremiumPdfMeta({
      clientName: mapaData.capa.nome,
      birthDate: mapaData.capa.dataNascimento,
      issueDate: dataEmissao,
      productName,
    });

    // 1 - Capa premium
    await renderCapaPage(pdf, mapaData.capa.nome, mapaData.capa.dataNascimento, dataEmissao);

    // 2A - Números Essenciais (Parte 1: Alma, Destino, Talento)
    pdf.addPage();
    await renderNumerosPageA(pdf, mapaData.numeros, mapaData.capa.nome, mapaData.capa.dataNascimento);

    // 2B - Números Essenciais (Parte 2: Sonho, Dom, Desafio Maior)
    pdf.addPage();
    await renderNumerosPageB(pdf, mapaData.numeros, mapaData.capa.nome, mapaData.capa.dataNascimento);


    // 3 - Ano Pessoal
    pdf.addPage();
    await renderAnoPessoalPage(pdf, mapaData.anoPessoal);

    // 4 - Calendário
    pdf.addPage();
    await renderCalendarioPage(pdf, mapaData.calendario);

    // 5 - Jornada (imagem integral pg5)
    pdf.addPage();
    await renderJornadaPage(pdf);

    // 6 - Ciclos
    pdf.addPage();
    await renderCiclosPage(pdf, mapaData.ciclos);

    // 7 - Desafios
    pdf.addPage();
    await renderDesafiosPage(pdf, mapaData.desafios);

    // 8 - Presentes
    pdf.addPage();
    await renderPresentesPage(pdf, mapaData.presentes);

    // 9 - Compatibilidade (CONDICIONAL)
    if (hasCompatibilityData(data.compatibility)) {
      pdf.addPage();
      await renderCompatibilidadePage(pdf, data.compatibility!); // BG já é aplicado dentro da própria página quando usada isolada; aqui usamos template global igual às outras
    }

    const fileName = createFriendlyFileName(mapaData.capa.nome, productName);

    if (previewMode) {
      return { pdf, fileName };
    }

    pdf.save(fileName);
    return { pdf, fileName };
  } catch (error) {
    console.error('❌ Erro ao gerar PDF Mapa da Alma:', error);
    throw error;
  }
};
