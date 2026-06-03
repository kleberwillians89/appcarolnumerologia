import React, { useState } from 'react';
import NumerologyForm from './NumerologyForm';
import DetailedResultView from './DetailedResultView';
import NumberDetailModal from './NumberDetailModal';
import EducationalSection from './EducationalSection';
import LifeJourneyPreview from './LifeJourneyPreview';
import { PdfPreviewModal } from './PdfPreviewModal';
import { SaveProfileModal } from './SaveProfileModal';
import { calculateAllNumbers, NumerologyResult } from '../utils/numerologyCalculations';
import { generateUnifiedMapaDaAlmaPDF } from '../utils/unifiedPdfGenerator';
import { useAppContext } from '../contexts/AppContext';
import { saveProfile } from '../utils/profileStorage';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { isValidBrazilianPhone } from '@/utils/phoneUtils';


import {
  soulNumberInterpretations,
  destinyNumberInterpretations,
  domNumberInterpretations,
  talentNumberInterpretations,
  dreamNumberInterpretations
} from '../texts';
import { useAuth } from '../contexts/AuthContext';
import { formatDateBR } from '@/utils/dateUtils';


export default function NumerologyDashboard() {
  const [results, setResults] = useState<NumerologyResult | null>(null);
  const [userData, setUserData] = useState<{ name: string; birthDate: string; phone?: string; email?: string } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<{ number: number; title: string; description: string; type: string } | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{ pdf: any; fileName: string } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { user, logout } = useAuth();
  const { personalYearState } = useAppContext();
  const { toast } = useToast();




  const handleSubmit = (name: string, birthDate: string, phone: string, email?: string) => {
    const calculatedResults = calculateAllNumbers(name, birthDate);
    setResults(calculatedResults);
    setUserData({ name, birthDate, phone, email });
  };
  
  const handleDownloadPDF = async () => {
    if (results && userData) {
      if (!userData.phone || !isValidBrazilianPhone(userData.phone)) {
        toast({
          title: 'Telefone obrigatório',
          description: 'Informe o telefone/WhatsApp do cliente para gerar o PDF.',
          variant: 'destructive',
        });
        return;
      }

      try {
        setIsGeneratingPDF(true);
        
        // Coletar todos os dados disponíveis
        const pdfData: any = {
          numerology: {
            results,
            name: userData.name,
            birthDate: userData.birthDate,
            phone: userData.phone,
            email: userData.email
          }
        };
        
        // Adicionar dados do Ano Pessoal se disponíveis
        if (personalYearState.personalYear) {
          pdfData.personalYear = {
            year: personalYearState.personalYear,
            birthMonth: personalYearState.birthMonth,
            day: personalYearState.day,
            month: personalYearState.month
          };
        }
        
        const result = await generateUnifiedMapaDaAlmaPDF(pdfData, true);
        
        if (result && result.pdf) {
          setPdfPreview(result);
        } else {
          alert('⚠️ Não foi possível gerar o PDF. Verifique o console para mais detalhes.');
        }
      } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        alert('❌ Erro ao gerar o PDF. Por favor, verifique o console do navegador (F12) para mais detalhes.');
      } finally {
        setIsGeneratingPDF(false);
      }
    }
  };

  const handleSaveProfile = (profileName: string, notes: string) => {
    if (!results || !userData) return;
    
    const [year, month, day] = userData.birthDate.split('-');
    
    saveProfile({
      profileName,
      name: userData.name,
      birthDate: userData.birthDate,
      phone: userData.phone,
      email: userData.email,
      type: 'numerology',
      data: {
        numerology: results,
        day: parseInt(day),
        month: parseInt(month),
        year: parseInt(year)
      },
      results: {
        ...results,
        day: parseInt(day),
        month: parseInt(month),
        year: parseInt(year)
      },
      notes
    });

    toast({
      title: '✅ Perfil Salvo!',
      description: `${profileName} foi salvo e está disponível para Comparação e Compatibilidade.`,
    });
    
    setShowSaveModal(false);
  };

  const handleReset = () => {
    setResults(null);
    setUserData(null);
  };



  const icons = {
    soul: '✨',
    dom: '🎁',
    destiny: '🌟',
    talent: '💎',
    dream: '🌙'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760716569517_8e46a4cc.png')] bg-cover bg-center opacity-10"></div>

      
      <div className="relative z-10">
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Carol Graber - Portal de Numerologia</h1>
            <div className="flex items-center gap-4">
              <span className="text-purple-200">{user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12">
          {!results ? (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-4">Descubra Seu Mapa da Alma</h2>
                <p className="text-purple-200 text-lg">Calcule os 5 números essenciais da sua vida</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
                <NumerologyForm onSubmit={handleSubmit} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:border-purple-400/50 transition-all">
                  <img src="https://d64gsuwffb70l.cloudfront.net/68eff466bc46045404a9d741_1760556381330_a357aa19.webp" alt="Crystal" className="w-20 h-20 mx-auto mb-4 rounded-full" />
                  <h3 className="text-white font-semibold mb-2">Cálculos Precisos</h3>
                  <p className="text-purple-200 text-sm">Baseados na tabela pitagórica tradicional</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:border-purple-400/50 transition-all">
                  <img src="https://d64gsuwffb70l.cloudfront.net/68eff466bc46045404a9d741_1760556382063_306485cb.webp" alt="Mandala" className="w-20 h-20 mx-auto mb-4 rounded-full" />
                  <h3 className="text-white font-semibold mb-2">5 Números Essenciais</h3>
                  <p className="text-purple-200 text-sm">Alma, Dom, Destino, Talento e Sonho</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:border-purple-400/50 transition-all">
                  <img src="https://d64gsuwffb70l.cloudfront.net/68eff466bc46045404a9d741_1760556382786_5a749fd2.webp" alt="Book" className="w-20 h-20 mx-auto mb-4 rounded-full" />
                  <h3 className="text-white font-semibold mb-2">Relatório em PDF</h3>
                  <p className="text-purple-200 text-sm">Baixe seu mapa completo personalizado</p>
                </div>
              </div>

              <EducationalSection />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-2">Seu Mapa da Alma</h2>
                <p className="text-purple-200 text-lg">{userData?.name}</p>
                <p className="text-purple-300">Nascimento: {formatDateBR(userData?.birthDate)}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <div onClick={() => setSelectedNumber({ number: results.soul, title: 'Número da Alma', description: soulNumberInterpretations[results.soul]?.description || '', type: 'soul' })} className="cursor-pointer">
                  <DetailedResultView
                    number={results.soul}
                    title="Número da Alma"
                    description={soulNumberInterpretations[results.soul]?.description || ''}
                    icon={icons.soul}
                    type="soul"
                  />
                </div>
                <div onClick={() => setSelectedNumber({ number: results.dom, title: 'Número do Dom', description: domNumberInterpretations[results.dom]?.description || '', type: 'dom' })} className="cursor-pointer">
                  <DetailedResultView
                    number={results.dom}
                    title="Número do Dom"
                    description={domNumberInterpretations[results.dom]?.description || ''}
                    icon={icons.dom}
                    type="dom"
                  />
                </div>
                <div onClick={() => setSelectedNumber({ number: results.destiny, title: 'Número do Destino', description: destinyNumberInterpretations[results.destiny]?.description || '', type: 'destiny' })} className="cursor-pointer">
                  <DetailedResultView
                    number={results.destiny}
                    title="Número do Destino"
                    description={destinyNumberInterpretations[results.destiny]?.description || ''}
                    icon={icons.destiny}
                    type="destiny"
                  />
                </div>
                <div onClick={() => setSelectedNumber({ number: results.talent, title: 'Número do Talento', description: talentNumberInterpretations[results.talent]?.description || '', type: 'talent' })} className="cursor-pointer">
                  <DetailedResultView
                    number={results.talent}
                    title="Número do Talento"
                    description={talentNumberInterpretations[results.talent]?.description || ''}
                    icon={icons.talent}
                    type="talent"
                  />
                </div>
                <div onClick={() => setSelectedNumber({ number: results.dream, title: 'Número do Sonho', description: dreamNumberInterpretations[results.dream]?.description || '', type: 'dream' })} className="cursor-pointer">
                  <DetailedResultView
                    number={results.dream}
                    title="Número do Sonho"
                    description={dreamNumberInterpretations[results.dream]?.description || ''}
                    icon={icons.dream}
                    type="dream"
                  />
                </div>
              </div>

              {/* Life Journey Preview Section */}
              {userData && <LifeJourneyPreview birthDate={userData.birthDate} />}



              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Perfil
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className={`px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isGeneratingPDF ? '⏳ Gerando PDF...' : '📄 Baixar PDF'}

                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-white/10 backdrop-blur-lg text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  🔄 Novo cálculo
                </button>
              </div>


              <EducationalSection />
            </div>
          )}
        </div>
      </div>
      {selectedNumber && (
        <NumberDetailModal
          isOpen={!!selectedNumber}
          onClose={() => setSelectedNumber(null)}
          number={selectedNumber.number}
          title={selectedNumber.title}
          description={selectedNumber.description}
          type={selectedNumber.type}
        />
      )}
      
      {pdfPreview && (
        <PdfPreviewModal
          isOpen={!!pdfPreview}
          onClose={() => setPdfPreview(null)}
          pdfDoc={pdfPreview.pdf}
          fileName={pdfPreview.fileName}
        />
      )}

      <SaveProfileModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveProfile}
        defaultName={userData?.name || ''}
      />
    </div>
  );
}
