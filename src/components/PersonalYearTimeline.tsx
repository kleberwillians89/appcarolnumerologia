import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface PersonalYearTimelineProps {
  currentYear: number;
}

const PersonalYearTimeline: React.FC<PersonalYearTimelineProps> = ({ currentYear }) => {
  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  const yearLabels: { [key: number]: string } = {
    1: 'Início',
    2: 'Cooperação',
    3: 'Expansão',
    4: 'Estrutura',
    5: 'Mudança',
    6: 'Harmonia',
    7: 'Reflexão',
    8: 'Colheita',
    9: 'Finalização'
  };

  const yearColors: { [key: number]: string } = {
    1: 'from-red-500 to-orange-500',
    2: 'from-orange-500 to-yellow-500',
    3: 'from-yellow-500 to-green-500',
    4: 'from-green-500 to-teal-500',
    5: 'from-teal-500 to-blue-500',
    6: 'from-blue-500 to-indigo-500',
    7: 'from-indigo-500 to-purple-500',
    8: 'from-purple-500 to-pink-500',
    9: 'from-pink-500 to-red-500'
  };

  return (
    <Card className="shadow-xl hidden md:block">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Ciclo de 9 Anos - Sua Jornada</CardTitle>
        <p className="text-center text-gray-600 text-sm">
          Cada ano tem sua energia única. Você está no Ano {currentYear}.
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto pb-2">
          {/* Timeline line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-blue-500 to-pink-500 rounded-full" />
          
          {/* Year markers */}
          <div className="relative flex justify-between items-start">
            {years.map((year) => {
              const isCurrent = year === currentYear;
              const isPast = year < currentYear;
              
              return (
                <div key={year} className="flex flex-col items-center" style={{ width: '11.11%' }}>
                  <div
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center 
                      font-bold text-xl
                      transition-all duration-300 relative z-10
                      ${isCurrent 
                        ? `bg-gradient-to-br ${yearColors[year]} text-white shadow-2xl scale-125 ring-4 ring-white` 
                        : isPast
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-white text-gray-400 border-2 border-gray-300'
                      }
                    `}
                  >
                    {year}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`text-xs font-semibold ${isCurrent ? 'text-indigo-600' : 'text-gray-600'}`}>
                      {yearLabels[year]}
                    </div>
                    {isCurrent && (
                      <Badge className="mt-1 bg-indigo-600 text-white text-xs px-2 py-1">
                        Você está aqui
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="font-semibold text-red-700 text-sm">Anos 1-3</div>
            <div className="text-gray-600 text-xs mt-1">Fase de Plantio</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-700 text-sm">Anos 4-6</div>
            <div className="text-gray-600 text-xs mt-1">Fase de Crescimento</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="font-semibold text-purple-700 text-sm">Anos 7-9</div>
            <div className="text-gray-600 text-xs mt-1">Fase de Colheita</div>
          </div>
        </div>
      </CardContent>
      </Card>
  );
};

export default PersonalYearTimeline;
