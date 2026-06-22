export type IntakeFieldType = 'text' | 'email' | 'tel' | 'date' | 'time' | 'number' | 'textarea' | 'select';

export interface IntakeField {
  key: string;
  label: string;
  type: IntakeFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export const BASE_INTAKE_FIELDS: IntakeField[] = [
  { key: 'nome', label: 'Nome completo', type: 'text', required: true },
  { key: 'telefone', label: 'WhatsApp', type: 'tel', required: true, placeholder: '(11) 99999-9999' },
  { key: 'email', label: 'E-mail', type: 'email', required: true },
  { key: 'dataNascimento', label: 'Data de nascimento', type: 'date', required: true },
  { key: 'observacoesCliente', label: 'Observações ou objetivo com a análise', type: 'textarea', required: true },
];

const fields: Record<string, IntakeField[]> = {
  desvende_mapa: [
    { key: 'nomeNascimento', label: 'Nome completo de nascimento', type: 'text', required: true },
    { key: 'nomeAtual', label: 'Nome usado atualmente', type: 'text', required: true },
    { key: 'horaNascimento', label: 'Hora de nascimento (opcional)', type: 'time' },
    { key: 'cidadeEstadoNascimento', label: 'Cidade e estado de nascimento', type: 'text', required: true },
    { key: 'momentoVida', label: 'Principal dúvida ou momento de vida', type: 'textarea', required: true },
  ],
  mapa_numerologico_pessoal: [
    { key: 'nomeNascimento', label: 'Nome completo de nascimento', type: 'text', required: true },
    { key: 'nomeAtual', label: 'Nome usado atualmente', type: 'text', required: true },
    { key: 'cidadeEstadoNascimento', label: 'Cidade e estado de nascimento', type: 'text', required: true },
    { key: 'objetivoSessao', label: 'Objetivo da sessão', type: 'textarea', required: true },
    { key: 'temaPrincipal', label: 'Principal tema que deseja trabalhar', type: 'textarea', required: true },
  ],
  revisao_numerologica_anual: [
    { key: 'jaFezMapaCarol', label: 'Já fez mapa com a Carol?', type: 'select', required: true, options: ['Sim', 'Não'] },
    { key: 'anoAnalise', label: 'Ano que deseja analisar', type: 'number', required: true },
    { key: 'acontecimentosRecentes', label: 'Principais acontecimentos recentes', type: 'textarea', required: true },
    { key: 'focoNovoCiclo', label: 'Principal foco para o novo ciclo', type: 'textarea', required: true },
  ],
  mapa_crianca: [
    { key: 'nomeCrianca', label: 'Nome completo da criança', type: 'text', required: true },
    { key: 'nascimentoCrianca', label: 'Data de nascimento da criança', type: 'date', required: true },
    { key: 'responsaveis', label: 'Nome dos responsáveis', type: 'text', required: true },
    { key: 'idadeCrianca', label: 'Idade da criança', type: 'number', required: true },
    { key: 'duvidasPais', label: 'Principais dúvidas dos pais', type: 'textarea', required: true },
    { key: 'comportamentos', label: 'Pontos de comportamento que desejam compreender', type: 'textarea', required: true },
  ],
  mapa_adolescente: [
    { key: 'nomeAdolescente', label: 'Nome completo do adolescente', type: 'text', required: true },
    { key: 'nascimentoAdolescente', label: 'Data de nascimento do adolescente', type: 'date', required: true },
    { key: 'idadeAdolescente', label: 'Idade', type: 'number', required: true },
    { key: 'responsavel', label: 'Nome do responsável', type: 'text', required: true },
    { key: 'duvidasFaseAtual', label: 'Principais dúvidas sobre a fase atual', type: 'textarea', required: true },
    { key: 'temaAdolescente', label: 'Tema principal', type: 'select', required: true, options: ['Identidade', 'Escolhas', 'Estudos', 'Carreira', 'Emoções', 'Relações'] },
  ],
  orientacao_vocacional_profissional: [
    { key: 'momentoProfissional', label: 'Momento profissional atual', type: 'textarea', required: true },
    { key: 'areasInteresse', label: 'Áreas de interesse', type: 'textarea', required: true },
    { key: 'duvidasCarreira', label: 'Dúvidas de carreira', type: 'textarea', required: true },
    { key: 'objetivoCarreira', label: 'O que você busca?', type: 'select', required: true, options: ['Escolha', 'Transição', 'Reposicionamento'] },
  ],
  sinastria_casal: [
    { key: 'nomePessoa1', label: 'Nome completo da pessoa 1', type: 'text', required: true },
    { key: 'nascimentoPessoa1', label: 'Data de nascimento da pessoa 1', type: 'date', required: true },
    { key: 'nomePessoa2', label: 'Nome completo da pessoa 2', type: 'text', required: true },
    { key: 'nascimentoPessoa2', label: 'Data de nascimento da pessoa 2', type: 'date', required: true },
    { key: 'tipoRelacao', label: 'Tipo de relação', type: 'text', required: true },
    { key: 'questaoCasal', label: 'Principal questão do casal', type: 'textarea', required: true },
  ],
  nome_bebe: [
    { key: 'nomePais', label: 'Nome dos pais', type: 'text', required: true },
    { key: 'dataPrevistaNascimento', label: 'Data prevista de nascimento (se houver)', type: 'date' },
    { key: 'sobrenomes', label: 'Sobrenomes que serão usados', type: 'text', required: true },
    { key: 'nomesAnalise', label: 'Lista de nomes em análise', type: 'textarea', required: true },
    { key: 'preferenciasNomes', label: 'Preferências ou nomes que não querem usar', type: 'textarea' },
    { key: 'objetivoEscolha', label: 'Objetivo da escolha', type: 'textarea', required: true },
  ],
  data_cesarea: [
    { key: 'nomeMae', label: 'Nome da mãe', type: 'text', required: true },
    { key: 'nascimentoMae', label: 'Data de nascimento da mãe', type: 'date', required: true },
    { key: 'nomeBebe', label: 'Nome do bebê (se já tiver)', type: 'text' },
    { key: 'datasAutorizadas', label: 'Datas autorizadas pelo médico', type: 'textarea', required: true },
    { key: 'observacoesMedicas', label: 'Observações médicas relevantes', type: 'textarea' },
  ],
  abertura_empresa: [
    { key: 'nomeSocios', label: 'Nome dos sócios', type: 'textarea', required: true },
    { key: 'nascimentoSocios', label: 'Datas de nascimento dos sócios', type: 'textarea', required: true },
    { key: 'ideiasNome', label: 'Nome atual ou ideias de nome', type: 'textarea', required: true },
    { key: 'areaAtuacao', label: 'Área de atuação', type: 'text', required: true },
    { key: 'datasAbertura', label: 'Datas possíveis de abertura', type: 'textarea' },
    { key: 'objetivoEmpresa', label: 'Objetivo da empresa', type: 'textarea', required: true },
    { key: 'energiaNegocio', label: 'Energia desejada para o negócio', type: 'textarea', required: true },
  ],
  nome_profissional_marca: [
    { key: 'nomeAnalisar', label: 'Nome profissional, marca ou Instagram', type: 'text', required: true },
    { key: 'areaAtuacao', label: 'Área de atuação', type: 'text', required: true },
    { key: 'publicoDesejado', label: 'Público que deseja atrair', type: 'textarea', required: true },
    { key: 'objetivoPosicionamento', label: 'Objetivo do posicionamento', type: 'textarea', required: true },
  ],
  mentoria_individual: [
    { key: 'momentoVidaAtual', label: 'Momento de vida atual', type: 'textarea', required: true },
    { key: 'transformacaoDesejada', label: 'O que deseja transformar', type: 'textarea', required: true },
    { key: 'temasPrioritarios', label: 'Temas prioritários', type: 'textarea', required: true },
    { key: 'disponibilidade', label: 'Disponibilidade para encontros', type: 'textarea', required: true },
    { key: 'expectativaMentoria', label: 'Expectativa com a mentoria', type: 'textarea', required: true },
  ],
};

export const getProductIntakeFields = (productKey: string) => [...BASE_INTAKE_FIELDS, ...(fields[productKey] || [])];
