import React from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface DetailedResultViewProps {
  number: number;
  title: string;
  description: string;
  icon: string;
  type: 'soul' | 'dom' | 'destiny' | 'talent' | 'dream';
}

const numberTitles: { [key: number]: string } = {
  1: 'A Força da Liderança',
  2: 'A Diplomacia da Cooperação',
  3: 'A Criatividade da Expressão',
  4: 'A Estabilidade da Estrutura',
  5: 'A Liberdade da Mudança',
  6: 'A Harmonia da Responsabilidade',
  7: 'A Sabedoria da Introspecção',
  8: 'O Poder da Realização',
  9: 'A Compaixão do Humanitário',
  11: 'A Intuição do Mestre',
  22: 'O Construtor de Sonhos'
};

export default function DetailedResultView({ number, title, description, icon, type }: DetailedResultViewProps) {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 hover:border-purple-400/50 transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-purple-300">{number}</span>
            <span className="text-lg text-purple-200">{numberTitles[number]}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-white/5 rounded-lg">
        <p className="text-purple-100 leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}
