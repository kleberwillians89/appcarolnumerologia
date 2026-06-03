import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from 'lucide-react';

interface MonthlyForecastProps {
  personalYear: number;
  birthMonth?: number;
}

const MonthlyForecast: React.FC<MonthlyForecastProps> = ({ personalYear, birthMonth = 1 }) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear();
  
  // Create array of months starting from birth month
  const orderedMonths = birthMonth > 0 ? [
    ...months.slice(birthMonth - 1),
    ...months.slice(0, birthMonth - 1)
  ] : months;
  
  // Create corresponding month numbers
  const orderedMonthNumbers = birthMonth > 0 ? [
    ...Array.from({ length: 13 - birthMonth }, (_, i) => birthMonth + i),
    ...Array.from({ length: birthMonth - 1 }, (_, i) => i + 1)
  ] : Array.from({ length: 12 }, (_, i) => i + 1);


  const getMonthlyGuidance = (month: number, year: number): string => {
    const guidance: { [key: string]: string } = {
      '1-1': 'Mês perfeito para iniciar projetos. Sua energia está no auge!',
      '1-2': 'Foque em parcerias que apoiem seus novos começos.',
      '1-3': 'Comunique suas ideias com clareza e confiança.',
      '1-4': 'Organize os detalhes dos projetos iniciados.',
      '1-5': 'Esteja aberto a ajustes e mudanças de rota.',
      '1-6': 'Equilibre ambição profissional com vida familiar.',
      '1-7': 'Reflita sobre o progresso e ajuste estratégias.',
      '1-8': 'Mês favorável para questões financeiras.',
      '1-9': 'Finalize o que não serve mais antes do novo ciclo.',
      '1-10': 'Celebre conquistas e planeje próximos passos.',
      '1-11': 'Intuição elevada - confie nos insights.',
      '1-12': 'Encerre o ano com gratidão e preparação.',
      
      '2-1': 'Inicie o ano fortalecendo vínculos importantes.',
      '2-2': 'Mês de alta sensibilidade - pratique autocuidado.',
      '2-3': 'Comunique sentimentos com clareza e amor.',
      '2-4': 'Construa bases sólidas nos relacionamentos.',
      '2-5': 'Aceite mudanças nas dinâmicas relacionais.',
      '2-6': 'Harmonia familiar em destaque - cuide do lar.',
      '2-7': 'Momento de introspecção sobre parcerias.',
      '2-8': 'Acordos e contratos favorecem prosperidade.',
      '2-9': 'Libere relações que não nutrem mais.',
      '2-10': 'Celebre conexões verdadeiras.',
      '2-11': 'Intuição guia decisões relacionais.',
      '2-12': 'Gratidão pelas pessoas que apoiaram você.',

      '3-1': 'Comunique suas ideias com entusiasmo!',
      '3-2': 'Colaborações criativas trazem resultados.',
      '3-3': 'Mês de máxima expressão e criatividade.',
      '3-4': 'Organize projetos criativos com disciplina.',
      '3-5': 'Explore novas formas de se expressar.',
      '3-6': 'Compartilhe talentos com família e comunidade.',
      '3-7': 'Aprofunde conhecimentos em áreas de interesse.',
      '3-8': 'Monetize seus talentos criativos.',
      '3-9': 'Finalize projetos antes de iniciar novos.',
      '3-10': 'Celebre conquistas criativas.',
      '3-11': 'Inspiração elevada - capture ideias.',
      '3-12': 'Planeje expansão criativa para próximo ano.',

      '4-1': 'Estabeleça metas claras e planos de ação.',
      '4-2': 'Trabalhe em equipe com disciplina.',
      '4-3': 'Comunique planos e organize detalhes.',
      '4-4': 'Mês de trabalho intenso - foque na construção.',
      '4-5': 'Adapte estruturas quando necessário.',
      '4-6': 'Organize lar e rotinas familiares.',
      '4-7': 'Revise processos e otimize sistemas.',
      '4-8': 'Colha frutos do trabalho árduo.',
      '4-9': 'Finalize projetos e organize pendências.',
      '4-10': 'Celebre bases sólidas construídas.',
      '4-11': 'Intuição sobre próximos passos práticos.',
      '4-12': 'Planeje estrutura para o novo ano.',

      '5-1': 'Abra-se para mudanças e novidades!',
      '5-2': 'Parcerias trazem oportunidades de mudança.',
      '5-3': 'Comunique desejos de transformação.',
      '5-4': 'Estruture mudanças com planejamento.',
      '5-5': 'Mês de máxima transformação - flua!',
      '5-6': 'Mudanças no lar trazem renovação.',
      '5-7': 'Reflita sobre direção das mudanças.',
      '5-8': 'Mudanças financeiras favorecem crescimento.',
      '5-9': 'Libere o velho para abraçar o novo.',
      '5-10': 'Celebre coragem de mudar.',
      '5-11': 'Intuição guia transformações.',
      '5-12': 'Prepare-se para estabilizar mudanças.',

      '6-1': 'Priorize família e lar desde o início.',
      '6-2': 'Fortaleça vínculos familiares com amor.',
      '6-3': 'Comunique afeto e resolva mal-entendidos.',
      '6-4': 'Organize e embeleze seu espaço.',
      '6-5': 'Aceite mudanças na dinâmica familiar.',
      '6-6': 'Mês de máxima harmonia doméstica.',
      '6-7': 'Reflita sobre responsabilidades familiares.',
      '6-8': 'Invista no conforto do lar.',
      '6-9': 'Libere mágoas e perdoe.',
      '6-10': 'Celebre amor e união familiar.',
      '6-11': 'Intuição sobre necessidades familiares.',
      '6-12': 'Gratidão pelo lar e família.',

      '7-1': 'Inicie ano com introspecção e estudo.',
      '7-2': 'Parcerias espirituais enriquecem jornada.',
      '7-3': 'Compartilhe sabedoria adquirida.',
      '7-4': 'Estruture práticas espirituais.',
      '7-5': 'Explore novas filosofias e crenças.',
      '7-6': 'Harmonize espiritualidade e vida prática.',
      '7-7': 'Mês de máxima conexão interior.',
      '7-8': 'Sabedoria traz oportunidades.',
      '7-9': 'Libere crenças limitantes.',
      '7-10': 'Celebre crescimento espiritual.',
      '7-11': 'Intuição no auge - medite e ouça.',
      '7-12': 'Integre aprendizados do ano.',

      '8-1': 'Estabeleça metas financeiras ambiciosas.',
      '8-2': 'Parcerias de negócios prosperam.',
      '8-3': 'Comunique valor e negocie bem.',
      '8-4': 'Construa patrimônio com disciplina.',
      '8-5': 'Adapte estratégias financeiras.',
      '8-6': 'Equilibre prosperidade e família.',
      '8-7': 'Reflita sobre relação com dinheiro.',
      '8-8': 'Mês de máxima prosperidade - colha!',
      '8-9': 'Resolva pendências financeiras.',
      '8-10': 'Celebre conquistas materiais.',
      '8-11': 'Intuição sobre investimentos.',
      '8-12': 'Planeje finanças para novo ciclo.',

      '9-1': 'Libere o passado desde o início.',
      '9-2': 'Encerre parcerias que não servem mais.',
      '9-3': 'Comunique despedidas com amor.',
      '9-4': 'Organize e doe o que não usa.',
      '9-5': 'Aceite mudanças e finalizações.',
      '9-6': 'Perdoe e cure relações familiares.',
      '9-7': 'Reflita sobre ciclo que se encerra.',
      '9-8': 'Resolva questões financeiras pendentes.',
      '9-9': 'Mês de máximo desapego - solte tudo!',
      '9-10': 'Celebre jornada e aprendizados.',
      '9-11': 'Intuição sobre novo ciclo que vem.',
      '9-12': 'Prepare-se para recomeço em Ano 1.'
    };

    return guidance[`${year}-${month}`] || 'Mês de crescimento e aprendizado.';
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          Previsão Mensal para Ano Pessoal {personalYear} ({months[birthMonth - 1]} {currentYear} - {months[birthMonth === 1 ? 11 : birthMonth - 2]} {currentYear + 1})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedMonths.map((month, index) => {
            const monthNumber = orderedMonthNumbers[index];
            const yearSuffix = index < (13 - birthMonth) ? currentYear : currentYear + 1;
            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="font-semibold text-indigo-700 mb-2">{month} {yearSuffix}</div>
                <p className="text-sm text-gray-600">
                  {getMonthlyGuidance(monthNumber, personalYear)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyForecast;
