import React from 'react';
import { calculateLifeCycles, calculateChallenges, calculatePresents } from '../utils/numerologyCalculations2';

interface LifeJourneyPreviewProps {
  birthDate: string;
}

export default function LifeJourneyPreview({ birthDate }: LifeJourneyPreviewProps) {
  const [year, month, day] = birthDate.split('-').map(Number);
  
  const cycles = calculateLifeCycles(day, month, year);
  const challenges = calculateChallenges(day, month, year);
  const presents = calculatePresents(day, month, year);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-white mb-2">📖 Jornada da Vida</h3>
        <p className="text-purple-200">Este conteúdo será incluído no seu PDF "Mapa da Alma"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ciclos de Vida */}
        <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-400/30">
          <div className="text-center mb-4">
            <span className="text-4xl mb-2 block">🔄</span>
            <h4 className="text-xl font-bold text-white">Ciclos de Vida</h4>
            <p className="text-purple-200 text-sm">Fases da sua jornada</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm">0-28 anos</span>
                <span className="text-2xl font-bold text-white">{cycles.first.value}</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm">29-56 anos</span>
                <span className="text-2xl font-bold text-white">{cycles.second.value}</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm">57+ anos</span>
                <span className="text-2xl font-bold text-white">{cycles.third.value}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desafios */}
        <div className="bg-orange-500/20 rounded-xl p-6 border border-orange-400/30">
          <div className="text-center mb-4">
            <span className="text-4xl mb-2 block">⚡</span>
            <h4 className="text-xl font-bold text-white">Desafios</h4>
            <p className="text-orange-200 text-sm">Lições a superar</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-orange-200 text-sm">0-28 anos</span>
                <span className="text-2xl font-bold text-white">{challenges.first.value}</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-orange-200 text-sm">29-56 anos</span>
                <span className="text-2xl font-bold text-white">{challenges.second.value}</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-orange-200 text-sm">Vida toda</span>
                <span className="text-2xl font-bold text-white">{challenges.major.value}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Presentes */}
        <div className="bg-green-500/20 rounded-xl p-6 border border-green-400/30">
          <div className="text-center mb-4">
            <span className="text-4xl mb-2 block">🎁</span>
            <h4 className="text-xl font-bold text-white">Presentes</h4>
            <p className="text-green-200 text-sm">Dons a desenvolver</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-green-200 text-sm">0-29 anos</span>
                <span className="text-2xl font-bold text-white">{presents.first.value}</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-green-200 text-sm">30-39 anos</span>
                <span className="text-2xl font-bold text-white">{presents.second.value}</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-green-200 text-sm">40-49 anos</span>
                <span className="text-2xl font-bold text-white">{presents.third.value}</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-green-200 text-sm">50+ anos</span>
                <span className="text-2xl font-bold text-white">{presents.fourth.value}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-lg px-4 py-2">
          <span className="text-blue-200">ℹ️</span>
          <p className="text-blue-200 text-sm">
            Análises detalhadas de cada número estarão no PDF completo
          </p>
        </div>
      </div>
    </div>
  );
}
