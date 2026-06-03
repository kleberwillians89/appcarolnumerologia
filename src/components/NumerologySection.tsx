import { useRef, useState, useEffect } from 'react';
import NumerologyForm from './NumerologyForm';
import ResultCard from './ResultCard';
import EducationalSection from './EducationalSection';
import { calculateAllNumbers, NumerologyResult } from '../utils/numerologyCalculations';
import { calculateLifeCycles, calculateChallenges, calculatePresents } from '../utils/numerologyCalculations2';
import { soulNumberInterpretations, destinyNumberInterpretations, domNumberInterpretations, talentNumberInterpretations, dreamNumberInterpretations, challengeNumberInterpretations } from '../texts';
import { LifeJourneyModal } from './LifeJourneyModal';
import { SaveProfileModal } from './SaveProfileModal';
import { useAppContext } from '../contexts/AppContext';
import { saveProfile } from '../utils/profileStorage';
import { useToast } from '@/hooks/use-toast';
import { deliveryService } from '@/services/deliveryService';
import { generatePdfForProduct } from '@/services/pdfDeliveryService';
import { isValidBrazilianPhone, normalizeBrazilianPhone } from '@/utils/phoneUtils';
import { enableGoogleSheetsSync, googleSheetsWebhookUrl } from '@/config/env';
import { sendLeadToGoogleSheets } from '@/services/googleSheetsService';
import { formatDateBR, parseLocalDateParts } from '@/utils/dateUtils';



export const NumerologySection = () => {
  const { setBirthDate, numerologyState, setNumerologyState, saveNumerologyToHistory } = useAppContext();
  const { toast } = useToast();

  const [results, setResults] = useState<NumerologyResult | null>(numerologyState.results);
  const [userData, setUserData] = useState<{ name: string; birthDate: string; phone?: string; email?: string; } | null>(numerologyState.userData);
  const [showLifeJourney, setShowLifeJourney] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [lifeCycles, setLifeCycles] = useState<any>(numerologyState.lifeCycles);
  const [challenges, setChallenges] = useState<any>(numerologyState.challenges);
  const [presents, setPresents] = useState<number[]>(numerologyState.presents);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lastSheetsSubmissionKey, setLastSheetsSubmissionKey] = useState<string | null>(null);
  const sheetsSubmissionInFlightRef = useRef<string | null>(null);


  // Restore state from context on mount
  useEffect(() => {
    if (numerologyState.results) {
      setResults(numerologyState.results);
      setUserData(numerologyState.userData);
      setLifeCycles(numerologyState.lifeCycles);
      setChallenges(numerologyState.challenges);
      setPresents(numerologyState.presents);
    }
  }, []);

  const buildSheetsSubmissionKey = (name: string, birthDate: string, phone: string) =>
    `${name.trim().toLowerCase()}|${phone.trim()}|${birthDate}|Mapa da Alma`;

  const sendCalculationToSheets = async (name: string, birthDate: string, phone: string, email?: string) => {
    if (!enableGoogleSheetsSync || !googleSheetsWebhookUrl) return;

    const submissionKey = buildSheetsSubmissionKey(name, birthDate, phone);
    if (submissionKey === lastSheetsSubmissionKey || submissionKey === sheetsSubmissionInFlightRef.current) return;

    sheetsSubmissionInFlightRef.current = submissionKey;
    const result = await sendLeadToGoogleSheets({
      nome: name.trim(),
      whatsapp: phone,
      telefone: phone,
      email: email?.trim() || '',
      dataNascimento: birthDate,
      produto: 'Mapa da Alma',
      status: 'Cálculo realizado',
      arquivoPdf: '',
      observacoes: '',
      origem: 'app',
    });

    if (result.success) {
      setLastSheetsSubmissionKey(submissionKey);
      sheetsSubmissionInFlightRef.current = null;
      return;
    }

    sheetsSubmissionInFlightRef.current = null;
    console.warn('[NumerologySection] Google Sheets não recebeu o cálculo', result.error);
    toast({
      title: 'Cálculo realizado',
      description: 'Não foi possível registrar no Google Sheets agora.',
      variant: 'destructive',
    });
  };

  const handleSubmit = (name: string, birthDate: string, phone: string, email?: string) => {
    const calculatedResults = calculateAllNumbers(name, birthDate);
    setResults(calculatedResults);
    setUserData({ name, birthDate, phone, email });
    setBirthDate(birthDate);
    
    const { year, month, day } = parseLocalDateParts(birthDate);
    const cyclesData = calculateLifeCycles(day, month, year);
    const challengesData = calculateChallenges(day, month, year);
    const presentsDataObj = calculatePresents(day, month, year);
    
    // Convert presents object to array for the modal
    const presentsArray = [
      presentsDataObj.first.value,
      presentsDataObj.second.value,
      presentsDataObj.third.value,
      presentsDataObj.fourth.value
    ];
    
    setLifeCycles(cyclesData);
    setChallenges(challengesData);
    setPresents(presentsArray);

    // Save to context
    setNumerologyState({
      results: calculatedResults,
      userData: { name, birthDate, phone, email },
      lifeCycles: cyclesData,
      challenges: challengesData,
      presents: presentsArray,
    });

    // Save to history automatically
    saveNumerologyToHistory(name, birthDate, calculatedResults, cyclesData, challengesData, presentsArray);

    void sendCalculationToSheets(name, birthDate, phone, email);
  };





  const handleReset = () => {
    setResults(null);
    setUserData(null);
    setShowLifeJourney(false);
    // Clear context state
    setNumerologyState({
      results: null,
      userData: null,
      lifeCycles: null,
      challenges: null,
      presents: [],
    });
  };

  const handleSaveProfile = (profileName: string, notes: string, tags: string[] = []) => {
    if (!userData || !results) return;
    
    saveProfile({
      profileName,
      name: userData.name,
      birthDate: userData.birthDate,
      phone: userData.phone,
      email: userData.email,
      type: 'numerology',
      data: {
        lifeCycles,
        challenges,
        presents,
      },
      results,
      notes,
      tags,
    });

    toast({
      title: 'Perfil salvo!',
      description: `${profileName} foi salvo com sucesso.`,
    });
  };

  const downloadPdfDataUrl = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  };

  const handleGeneratePdf = async (createDelivery: boolean) => {
    if (!userData?.name || !userData.birthDate || !results) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha nome e data de nascimento antes de gerar o PDF.',
        variant: 'destructive',
      });
      return;
    }
    if (!userData.phone || !isValidBrazilianPhone(userData.phone)) {
      toast({
        title: 'Telefone obrigatório',
        description: 'Informe o telefone/WhatsApp do cliente para gerar o PDF e criar a entrega.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const pdfResult = await generatePdfForProduct({
        produto: 'mapa',
        cliente: {
          nome: userData.name,
          dataNascimento: userData.birthDate,
          telefone: userData.phone || '',
          email: userData.email,
        },
        dadosNumerologicos: {
          results,
        },
        origem: 'plataforma',
      });

      if (!pdfResult.success) {
        toast({
          title: 'Não foi possível gerar o PDF',
          description: pdfResult.error,
          variant: 'destructive',
        });
        return;
      }

      if (pdfResult.pdfDataUrl && pdfResult.fileName) {
        downloadPdfDataUrl(pdfResult.pdfDataUrl, pdfResult.fileName);
      }

      if (createDelivery) {
        await deliveryService.createDelivery({
          nome: userData.name,
          telefone: userData.phone || '',
          telefoneNormalizado: normalizeBrazilianPhone(userData.phone || ''),
          email: userData.email || '',
          produto: 'mapa',
          status: 'PDF_GERADO',
          dataNascimento: userData.birthDate,
          linkPdf: pdfResult.linkPdf || null,
          pdfDataUrl: pdfResult.pdfDataUrl || null,
          fileName: pdfResult.fileName || null,
          origem: 'plataforma',
          observacoesCliente: '',
          observacoesCarol: 'Entrega criada a partir do Mapa da Alma.',
          dadosNumerologicos: {
            results,
          },
          dadosCliente: {
            nome: userData.name,
            telefone: userData.phone || '',
            telefoneNormalizado: normalizeBrazilianPhone(userData.phone || ''),
            email: userData.email || '',
            dataNascimento: userData.birthDate,
            produto: 'mapa',
            origem: 'plataforma',
          },
        });

        toast({
          title: 'Entrega criada',
          description: `${userData.name} foi enviado para a aba Entregas.`,
        });
      } else {
        toast({
          title: 'PDF gerado',
          description: 'O PDF do Mapa da Alma foi baixado.',
        });
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };






  const icons = { soul: '✨', dom: '🎁', destiny: '🌟', talent: '💎', dream: '🌙' };

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Descubra o Seu Mapa da Alma</h2>
          <p className="text-yellow-400 text-lg">Calcule os números essenciais da sua vida</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-yellow-500/20 mb-8">
          <NumerologyForm onSubmit={handleSubmit} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/20 text-center hover:border-yellow-500/50 transition-all">
            <img src="https://d64gsuwffb70l.cloudfront.net/68eff466bc46045404a9d741_1760556381330_a357aa19.webp" alt="Crystal" className="w-20 h-20 mx-auto mb-4 rounded-full" />
            <h3 className="text-white font-semibold mb-2">Cálculos Precisos</h3>
            <p className="text-slate-300 text-sm">Baseados na tabela pitagórica tradicional</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/20 text-center hover:border-yellow-500/50 transition-all">
            <img src="https://d64gsuwffb70l.cloudfront.net/68eff466bc46045404a9d741_1760556382063_306485cb.webp" alt="Mandala" className="w-20 h-20 mx-auto mb-4 rounded-full" />
            <h3 className="text-white font-semibold mb-2">5 Números Essenciais</h3>
            <p className="text-slate-300 text-sm">Alma, Dom, Destino, Talento e Sonho</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/20 text-center hover:border-yellow-500/50 transition-all">
            <img src="https://d64gsuwffb70l.cloudfront.net/68eff466bc46045404a9d741_1760556382786_5a749fd2.webp" alt="Book" className="w-20 h-20 mx-auto mb-4 rounded-full" />
            <h3 className="text-white font-semibold mb-2">Análise Completa</h3>
            <p className="text-slate-300 text-sm">Descubra seu mapa completo personalizado</p>
          </div>
        </div>

        <EducationalSection />
      </div>
    );
  }


  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Seu Mapa Numerológico</h2>
          <p className="text-yellow-400 text-lg">{userData?.name}</p>
          <p className="text-slate-300">Nascimento: {formatDateBR(userData?.birthDate)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ResultCard number={results.soul} title="Número da Alma" description={soulNumberInterpretations[results.soul]?.description || ''} icon={icons.soul} />
          <ResultCard number={results.dom} title="Número do Dom" description={domNumberInterpretations[results.dom]?.description || ''} icon={icons.dom} />
          <ResultCard number={results.destiny} title="Número do Destino" description={destinyNumberInterpretations[results.destiny]?.description || ''} icon={icons.destiny} />
          <ResultCard number={results.talent} title="Número do Talento" description={talentNumberInterpretations[results.talent]?.description || ''} icon={icons.talent} />
          <ResultCard number={results.dream} title="Número do Sonho" description={dreamNumberInterpretations[results.dream]?.description || ''} icon={icons.dream} />
          {challenges && (
            <ResultCard 
              number={challenges.major.value} 
              title="Desafio Maior" 
              description={challengeNumberInterpretations[challenges.major.value]?.description || ''} 
              icon="⚡" 
            />
          )}
        </div>





        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button 
            onClick={() => handleGeneratePdf(false)} 
            disabled={isGeneratingPdf}
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-60"
          >
            {isGeneratingPdf ? 'Gerando...' : '📄 Gerar PDF'}
          </button>
          <button 
            onClick={() => handleGeneratePdf(true)} 
            disabled={isGeneratingPdf}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-60"
          >
            📦 Gerar PDF e criar entrega
          </button>
          <button 
            onClick={() => setShowLifeJourney(true)} 
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            🌟 Jornada da Vida
          </button>
          <button 
            onClick={() => setShowSaveModal(true)} 
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            💾 Salvar Perfil
          </button>
          <button 
            onClick={handleReset} 
            className="px-8 py-3 bg-slate-800/50 backdrop-blur-lg text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-200 border border-yellow-500/20"
          >
            🔄 Novo cálculo
          </button>
        </div>


        <EducationalSection />
      </div>
      
      {showLifeJourney && lifeCycles && challenges && presents && userData && results && (
        <LifeJourneyModal
          isOpen={showLifeJourney}
          onClose={() => setShowLifeJourney(false)}
          cycles={lifeCycles}
          challenges={challenges}
          presents={presents}
          userName={userData.name}
          results={results}
          birthDate={userData.birthDate}
        />
      )}

      <SaveProfileModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveProfile}
        defaultName={userData?.name || ''}
      />
    </>

  );
};
