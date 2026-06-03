import React from 'react';

export default function EducationalSection() {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mt-12">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Como Funciona a Numerologia</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-purple-200">📊 Tabela Pitagórica</h3>
          <p className="text-purple-100 text-sm leading-relaxed">
            A numerologia utiliza a tabela pitagórica, onde cada letra do alfabeto corresponde a um número de 1 a 9. 
            Esta tabela foi desenvolvida por Pitágoras e é a base de todos os cálculos numerológicos.
          </p>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-purple-200 text-sm font-mono">
              A-I-J-S = 1 | B-K-T = 2 | C-L-U = 3<br/>
              D-M-V = 4 | E-N-W = 5 | F-O-X = 6<br/>
              G-P-Y = 7 | H-Q-Z = 8 | I-R = 9
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-purple-200">✨ Os 5 Números Essenciais</h3>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white font-semibold">Número da Alma - Motivação</p>
              <p className="text-purple-200 text-sm">É a sua essência. Representa o que você é como pessoa, aquilo que te motiva a seguir em frente e que dá sentido à sua vida.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white font-semibold">Número do Dom</p>
              <p className="text-purple-200 text-sm">O Número do Dom mostra a sua essência espiritual e o potencial intuitivo ou energético que você traz de vidas anteriores. Ele revela aquela habilidade natural que surge sem esforço, como algo que você simplesmente sabe fazer, mesmo sem ter aprendido formalmente.

Costuma ser associado ao plano da alma e da missão espiritual, enquanto o Talento está ligado ao plano da personalidade e da ação.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white font-semibold">Caminho do Destino - O Grande Guia</p>
              <p className="text-purple-200 text-sm">É o número mais importante do mapa. Ele representa a estrada que você percorre e o propósito da sua vida. O foco principal da sua jornada está em um aprendizado específico, que se repetirá de diferentes formas até que você o integre plenamente.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white font-semibold">Número do Talento - Expressão</p>
              <p className="text-purple-200 text-sm">CÉ o seu amuleto de vida. Quanto mais você pratica essa energia, mais conquistas alcança. Esse número também mostra como você se apresenta ao mundo, sua forma de se expressar e o dom que veio compartilhar com os outros.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white font-semibold">Número do Sonho - Íntimo</p>
              <p className="text-purple-200 text-sm">Indica suas aspirações e sonhos. Revela seus desejos e fantasias mais profundos. É a energia que te realiza, o que sua alma busca alcançar para se sentir completa.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-400/30">
        <h3 className="text-xl font-semibold text-white mb-3">🔢 Números Mestres</h3>
        <p className="text-purple-100 text-sm leading-relaxed">
          Os números 11, 22 e 33 são considerados números mestres na numerologia. Eles são reduzidos a um único dígito, mas 
          carregam uma vibração espiritual mais elevada e representam potenciais especiais de realização e iluminação.
        </p>
      </div>
    </div>
  );
}
