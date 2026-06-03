import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';
import { lifeCycleGeneralMeanings, lifeCyclesIntroText } from '../texts/lifeCycles';
import { challengeNumberInterpretations } from '../texts/challengeNumbers';
import { presentsIntroText, challengesIntroText } from '../texts/presentsAndChallenges';
import { presentNumberInterpretations } from '../texts/presents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';



interface LifeJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycles: any;
  challenges: any;
  presents: number[];
  userName: string;
  results: any;
  birthDate: string;
}

export const LifeJourneyModal: React.FC<LifeJourneyModalProps> = ({ 
  isOpen, onClose, cycles, challenges, presents, userName, birthDate 
}) => {
  useEffect(() => {
    if (isOpen) {
      console.log('LifeJourneyModal opened with data:', { cycles, challenges, presents, userName, birthDate });
    }
  }, [isOpen, cycles, challenges, presents, userName, birthDate]);

  if (!isOpen) return null;

  // Check if data is missing
  const hasData = cycles && challenges && presents && presents.length > 0;

  if (!hasData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Dados Incompletos
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              Não foi possível carregar os dados da Jornada da Vida. Por favor, faça um novo cálculo numerológico.
            </p>
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-900">
            🌟 Jornada da Vida - {userName}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Este conteúdo está incluído no PDF "Mapa da Alma" completo
          </p>
        </DialogHeader>
        
        <Tabs defaultValue="cycles" className="w-full">

          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="cycles">🔄 Ciclos</TabsTrigger>
            <TabsTrigger value="challenges">⚡ Desafios</TabsTrigger>
            <TabsTrigger value="presents">🎁 Presentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cycles" className="space-y-4">
            <Card className="p-4 bg-purple-50 border-purple-200">
              <p className="text-sm text-gray-700">{lifeCyclesIntroText}</p>
            </Card>
            
            {cycles?.first && (
              <Card className="p-4 border-purple-300">
                <h3 className="text-lg font-bold text-purple-900 mb-2">
                  1º Ciclo (0-28 anos): Número {cycles.first.value}
                </h3>
                <p className="text-sm font-semibold text-purple-700 mb-2">
                  {lifeCycleGeneralMeanings[cycles.first.value]?.title}
                </p>
                <p className="text-sm text-gray-700">
                  {lifeCycleGeneralMeanings[cycles.first.value]?.description}
                </p>
              </Card>
            )}
            
            {cycles?.second && (
              <Card className="p-4 border-purple-300">
                <h3 className="text-lg font-bold text-purple-900 mb-2">
                  2º Ciclo (29-56 anos): Número {cycles.second.value}
                </h3>
                <p className="text-sm font-semibold text-purple-700 mb-2">
                  {lifeCycleGeneralMeanings[cycles.second.value]?.title}
                </p>
                <p className="text-sm text-gray-700">
                  {lifeCycleGeneralMeanings[cycles.second.value]?.description}
                </p>
              </Card>
            )}
            
            {cycles?.third && (
              <Card className="p-4 border-purple-300">
                <h3 className="text-lg font-bold text-purple-900 mb-2">
                  3º Ciclo (57+ anos): Número {cycles.third.value}
                </h3>
                <p className="text-sm font-semibold text-purple-700 mb-2">
                  {lifeCycleGeneralMeanings[cycles.third.value]?.title}
                </p>
                <p className="text-sm text-gray-700">
                  {lifeCycleGeneralMeanings[cycles.third.value]?.description}
                </p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="challenges" className="space-y-4">
            <Card className="p-4 bg-orange-50 border-orange-200">
              <p className="text-sm text-gray-700">{challengesIntroText}</p>
            </Card>
            
            {challenges?.first && (
              <Card className="p-4 border-orange-300">
                <h3 className="text-lg font-bold text-orange-900 mb-2">
                  1º Desafio (0-28 anos): Número {challenges.first.value}
                </h3>
                <p className="text-sm font-semibold text-orange-700 mb-2">
                  {challengeNumberInterpretations[challenges.first.value]?.title}
                </p>
                <p className="text-sm text-gray-700">
                  {challengeNumberInterpretations[challenges.first.value]?.description}
                </p>
              </Card>
            )}
            
            {challenges?.second && (
              <Card className="p-4 border-orange-300">
                <h3 className="text-lg font-bold text-orange-900 mb-2">
                  2º Desafio (29-56 anos): Número {challenges.second.value}
                </h3>
                <p className="text-sm font-semibold text-orange-700 mb-2">
                  {challengeNumberInterpretations[challenges.second.value]?.title}
                </p>
                <p className="text-sm text-gray-700">
                  {challengeNumberInterpretations[challenges.second.value]?.description}
                </p>
              </Card>
            )}
            
            {challenges?.major && (
              <Card className="p-4 border-red-300 bg-red-50">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  Desafio Maior (Vida toda): Número {challenges.major.value}
                </h3>
                <p className="text-sm font-semibold text-red-700 mb-2">
                  {challengeNumberInterpretations[challenges.major.value]?.title}
                </p>
                <p className="text-sm text-gray-700">
                  {challengeNumberInterpretations[challenges.major.value]?.description}
                </p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="presents" className="space-y-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-sm text-gray-700">{presentsIntroText}</p>
            </Card>
            
            {presents && presents.map((present, idx) => {
              const ranges = ['0-29 anos', '30-39 anos', '40-49 anos', '50+ anos'];
              return (
                <Card key={idx} className="p-4 border-green-300">
                  <h3 className="text-lg font-bold text-green-900 mb-2">
                    {idx + 1}º Presente ({ranges[idx]}): Número {present}
                  </h3>
                  <p className="text-sm font-semibold text-green-700 mb-2">
                    {presentNumberInterpretations[present]?.title}
                  </p>
                  <p className="text-sm text-gray-700">
                    {presentNumberInterpretations[present]?.description}
                  </p>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
