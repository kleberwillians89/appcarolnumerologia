import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, TrendingUp, AlertCircle, Target, Sparkles, Download, Save } from 'lucide-react';
import { calculatePersonalYear } from '../utils/numerologyCalculations2';
import { personalYearInterpretations } from '../texts/personalYear';
import PersonalYearTimeline from './PersonalYearTimeline';
import MonthlyForecast from './MonthlyForecast';
import { Alert, AlertDescription } from './ui/alert';
import { useAppContext } from '../contexts/AppContext';
import { usePdfGeneration } from '../hooks/usePdfGeneration';
import { PdfErrorModal } from './PdfErrorModal';
import { ImagePreloadProgress } from './ImagePreloadProgress';
import { SaveProfileModal } from './SaveProfileModal';
import { saveProfile, SavedProfile } from '../utils/profileStorage';
import { useToast } from '@/hooks/use-toast';
import { ProfileSelector } from './ProfileSelector';
import { deliveryService } from '@/services/deliveryService';
import { generatePdfForProduct } from '@/services/pdfDeliveryService';
import { formatBrazilianPhone, isValidBrazilianPhone, normalizeBrazilianPhone } from '@/utils/phoneUtils';

const PersonalYearCalculator: React.FC = () => {
  const { birthDate: contextBirthDate, personalYearState, setPersonalYearState, savePersonalYearToHistory, numerologyState } = useAppContext();
  const { isGenerating, progress, error, showErrorModal, generatePdf, retry, closeErrorModal } = usePdfGeneration();
  const { toast } = useToast();

  const [day, setDay] = useState<string>(personalYearState.day);
  const [month, setMonth] = useState<string>(personalYearState.month);
  const [year, setYear] = useState<string>(''); // Ano de nascimento
  const [birthMonth, setBirthMonth] = useState<number>(personalYearState.birthMonth);
  const [personalYear, setPersonalYear] = useState<number | null>(personalYearState.personalYear);
  const [showResults, setShowResults] = useState(personalYearState.showResults);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [clientName, setClientName] = useState(numerologyState.userData?.name || '');
  const [clientPhone, setClientPhone] = useState(numerologyState.userData?.phone || '');
  const [clientEmail, setClientEmail] = useState(numerologyState.userData?.email || '');
  const [clientBirthDate, setClientBirthDate] = useState(numerologyState.userData?.birthDate || contextBirthDate || '');

  useEffect(() => {
    if (personalYearState.personalYear !== null) {
      setDay(personalYearState.day);
      setMonth(personalYearState.month);
      setBirthMonth(personalYearState.birthMonth);
      setPersonalYear(personalYearState.personalYear);
      setShowResults(personalYearState.showResults);
    }
  }, []);

  useEffect(() => {
    if (contextBirthDate) {
      const [y, m, d] = contextBirthDate.split('-').map(Number);
      setDay(d.toString());
      setMonth(m.toString());
      setYear(y.toString());
      setBirthMonth(m);
      setClientBirthDate(contextBirthDate);
    }
  }, [contextBirthDate]);

  useEffect(() => {
    if (!clientBirthDate) return;
    const [y, m, d] = clientBirthDate.split('-').map(Number);
    if (!y || !m || !d) return;

    setDay(d.toString());
    setMonth(m.toString());
    setYear(y.toString());
    setBirthMonth(m);
  }, [clientBirthDate]);


  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseInt(day);
    const m = parseInt(month);

    if (!clientName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome do cliente para calcular o Ano Pessoal.',
        variant: 'destructive',
      });
      return;
    }

    if (!clientBirthDate) {
      toast({
        title: 'Data obrigatória',
        description: 'Informe a data de nascimento do cliente.',
        variant: 'destructive',
      });
      return;
    }

    if (!clientPhone.trim() || !isValidBrazilianPhone(clientPhone)) {
      toast({
        title: 'Telefone obrigatório',
        description: 'Informe o telefone/WhatsApp do cliente para gerar o PDF e criar a entrega.',
        variant: 'destructive',
      });
      return;
    }

    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      const py = calculatePersonalYear(d, m, currentYear);
      setPersonalYear(py);
      setBirthMonth(m);
      setShowResults(true);
      
      setPersonalYearState({
        day,
        month,
        birthMonth: m,
        personalYear: py,
        showResults: true,
      });

      savePersonalYearToHistory(clientName.trim(), clientBirthDate, {
        personalYear: py,
        birthMonth: m,
        day,
        month,
        referenceYear: currentYear,
      });
    }
  };

  const downloadPdfDataUrl = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  };

  const handleDownloadPDF = async (createDelivery = false) => {
    if (personalYear) {
      if (!clientName.trim() || !clientBirthDate) {
        toast({
          title: 'Dados incompletos',
          description: 'Preencha nome e data de nascimento antes de gerar o PDF.',
          variant: 'destructive',
        });
        return;
      }

      if (!clientPhone.trim() || !isValidBrazilianPhone(clientPhone)) {
        toast({
          title: 'Telefone obrigatório',
          description: 'Informe o telefone/WhatsApp do cliente para gerar o PDF e criar a entrega.',
          variant: 'destructive',
        });
        return;
      }

      await generatePdf(async () => {
        const result = await generatePdfForProduct({
          produto: 'ano_pessoal',
          cliente: {
            nome: clientName.trim(),
            telefone: clientPhone,
            email: clientEmail.trim() || undefined,
            dataNascimento: clientBirthDate,
          },
          dadosNumerologicos: {
            personalYear: {
              year: personalYear,
              birthMonth,
              day,
              month,
              referenceYear: currentYear,
            },
          },
          origem: 'plataforma',
        });

        if (!result.success) {
          toast({
            title: 'Não foi possível gerar o PDF',
            description: result.error,
            variant: 'destructive',
          });
          return;
        }

        if (result.pdfDataUrl && result.fileName) {
          downloadPdfDataUrl(result.pdfDataUrl, result.fileName);
        }

        if (createDelivery) {
          await deliveryService.createDelivery({
            nome: clientName.trim(),
            telefone: clientPhone,
            telefoneNormalizado: normalizeBrazilianPhone(clientPhone),
            email: clientEmail.trim() || '',
            produto: 'ano_pessoal',
            status: 'PDF_GERADO',
            dataNascimento: clientBirthDate,
            linkPdf: result.linkPdf || null,
            pdfDataUrl: result.pdfDataUrl || null,
            fileName: result.fileName || null,
            origem: 'plataforma',
            observacoesCliente: '',
            observacoesCarol: 'Entrega criada a partir do Ano Pessoal.',
            dadosNumerologicos: {
              personalYear: {
                year: personalYear,
                birthMonth,
                day,
                month,
                referenceYear: currentYear,
              },
            },
            dadosCliente: {
              nome: clientName.trim(),
              telefone: clientPhone,
              telefoneNormalizado: normalizeBrazilianPhone(clientPhone),
              email: clientEmail.trim() || '',
              dataNascimento: clientBirthDate,
              produto: 'ano_pessoal',
              origem: 'plataforma',
            },
          });

          toast({
            title: 'Entrega criada',
            description: `${clientName.trim()} foi enviado para a aba Entregas.`,
          });
        } else {
          toast({
            title: 'PDF gerado',
            description: 'O PDF de Ano Pessoal foi baixado.',
          });
        }
      });
    }
  };


  const handleRetry = () => {
    retry();
    handleDownloadPDF();
  };

  const handleSaveProfile = (profileName: string, notes: string) => {
    if (!day || !month || !personalYear) return;
    
    // Se temos o ano de nascimento do contexto, usar ele. Caso contrário, avisar o usuário
    if (!year) {
      toast({
        title: 'Ano de nascimento necessário',
        description: 'Por favor, calcule sua numerologia completa primeiro para salvar o perfil com a data de nascimento correta.',
        variant: 'destructive',
      });
      return;
    }
    
    const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    saveProfile({
      profileName,
      name: clientName.trim() || profileName,
      birthDate,
      phone: clientPhone,
      email: clientEmail.trim() || undefined,
      type: 'personalYear',
      data: {
        personalYear,
        birthMonth,
        day,
        month,
        year,
        currentYear,
      },
      notes,
    });

    toast({
      title: 'Perfil salvo!',
      description: `${profileName} foi salvo com sucesso.`,
    });
    setShowSaveModal(false);
  };

  const handleProfileSelect = (profile: SavedProfile | null) => {
    if (profile && profile.data) {
      setClientName(profile.name || profile.profileName || '');
      setClientPhone(formatBrazilianPhone(profile.phone || ''));
      setClientEmail(profile.email || '');
      setDay(profile.data.day || '');
      setMonth(profile.data.month || '');
      setYear(profile.data.year || '');
      if (profile.birthDate) {
        const [y, m, d] = profile.birthDate.split('-').map(Number);
        setDay(d.toString());
        setMonth(m.toString());
        setYear(y.toString());
        setClientBirthDate(profile.birthDate);
      }
    } else {
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setClientBirthDate('');
      setDay('');
      setMonth('');
      setYear('');
    }
  };


  const interpretation = personalYear ? personalYearInterpretations[personalYear] : null;
  const currentYear = new Date().getFullYear();



  return (
    <>
      <ImagePreloadProgress progress={progress} isVisible={isGenerating} />
      <PdfErrorModal error={error} isOpen={showErrorModal} onClose={closeErrorModal} onRetry={handleRetry} />
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-6 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">Calculadora de Ano Pessoal</h1>
            <p className="text-base md:text-xl text-gray-600">Descubra em qual fase do ciclo de 9 anos você está</p>
          </div>


        {!showResults ? (
          <Card className="max-w-md mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                Calcular Seu Ano Pessoal
              </CardTitle>
              <CardDescription>
                Insira seu dia e mês de nascimento para descobrir seu ano pessoal em {currentYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4">
                <ProfileSelector onSelect={handleProfileSelect} filterType="personalYear" />

                <div className="space-y-4 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
                  <div>
                    <Label htmlFor="personal-year-name">Nome do cliente</Label>
                    <Input
                      id="personal-year-name"
                      value={clientName}
                      onChange={(event) => setClientName(event.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="personal-year-phone">Telefone / WhatsApp</Label>
                    <Input
                      id="personal-year-phone"
                      value={clientPhone}
                      onChange={(event) => setClientPhone(formatBrazilianPhone(event.target.value))}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="personal-year-email">Email (opcional)</Label>
                    <Input
                      id="personal-year-email"
                      type="email"
                      value={clientEmail}
                      onChange={(event) => setClientEmail(event.target.value)}
                      placeholder="cliente@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="personal-year-birth-date">Data de nascimento</Label>
                    <Input
                      id="personal-year-birth-date"
                      type="date"
                      value={clientBirthDate}
                      onChange={(event) => setClientBirthDate(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="day">Dia</Label>
                    <Input
                      id="day"
                      type="number"
                      min="1"
                      max="31"
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      placeholder="DD"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">Mês</Label>
                    <Input
                      id="month"
                      type="number"
                      min="1"
                      max="12"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      placeholder="MM"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Calcular Ano Pessoal
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <Card className="shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <CardContent className="pt-6 md:pt-8 text-center">
                <div className="mb-4">
                  <div className="text-6xl md:text-8xl font-bold mb-2">{personalYear}</div>
                  <h2 className="text-xl md:text-3xl font-semibold px-4">{interpretation?.title}</h2>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowResults(false);
                    // Clear context state
                    setPersonalYearState({
                      day: '',
                      month: '',
                      birthMonth: 0,
                      personalYear: null,
                      showResults: false,
                    });
                  }}
                  className="mt-4"
                >
                  Novo cálculo
                </Button>

              </CardContent>
            </Card>

            <PersonalYearTimeline currentYear={personalYear!} />

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Interpretação Completa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {interpretation?.description}
                </p>
              </CardContent>
            </Card>

            <MonthlyForecast personalYear={personalYear!} birthMonth={birthMonth} />

            <div className="grid md:grid-cols-3 gap-4 md:gap-6">

              <Card className="shadow-lg border-t-4 border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Target className="w-5 h-5" />
                    Oportunidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {getOpportunities(personalYear!).map((opp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-t-4 border-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <TrendingUp className="w-5 h-5" />
                    Temas Principais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {getThemes(personalYear!).map((theme, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{theme}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-t-4 border-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="w-5 h-5" />
                    Desafios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {getChallenges(personalYear!).map((challenge, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">⚠</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-6 md:mt-8">
              <Button onClick={() => handleDownloadPDF(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
              <Button onClick={() => handleDownloadPDF(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF e criar entrega
              </Button>
              <Button onClick={() => setShowSaveModal(true)} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Salvar Perfil
              </Button>
            </div>




            <Alert className="bg-indigo-50 border-indigo-200">

              <Sparkles className="w-4 h-4 text-indigo-600" />
              <AlertDescription className="text-indigo-900">
                <strong>Dica:</strong> Use este conhecimento para alinhar suas ações com a energia do ano. Cada fase do ciclo tem seu propósito único no seu desenvolvimento pessoal.
              </AlertDescription>
            </Alert>
          </div>
        )}
        </div>
      </div>

      <SaveProfileModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveProfile}
        defaultName={`Ano Pessoal ${personalYear || ''}`}
      />
    </>
  );
};


const getOpportunities = (year: number): string[] => {

  const opportunities: { [key: number]: string[] } = {
    1: ['Iniciar novos projetos', 'Desenvolver liderança', 'Afirmar independência', 'Criar novas oportunidades'],
    2: ['Fortalecer parcerias', 'Desenvolver intuição', 'Cultivar relacionamentos', 'Praticar diplomacia'],
    3: ['Expandir comunicação', 'Expressar criatividade', 'Crescimento profissional', 'Aumentar renda'],
    4: ['Construir bases sólidas', 'Organizar finanças', 'Estabelecer rotinas', 'Consolidar projetos'],
    5: ['Explorar mudanças', 'Viajar e conhecer', 'Libertar-se do passado', 'Experimentar o novo'],
    6: ['Harmonizar família', 'Cuidar do lar', 'Fortalecer vínculos', 'Resolver pendências'],
    7: ['Aprofundar estudos', 'Desenvolver espiritualidade', 'Buscar autoconhecimento', 'Refinar intuição'],
    8: ['Colher resultados', 'Prosperar financeiramente', 'Resolver questões legais', 'Alcançar reconhecimento'],
    9: ['Encerrar ciclos', 'Praticar desapego', 'Ajudar outros', 'Preparar novo começo']
  };
  return opportunities[year] || [];
};

const getThemes = (year: number): string[] => {
  const themes: { [key: number]: string[] } = {
    1: ['Novos começos', 'Independência', 'Coragem', 'Iniciativa'],
    2: ['Parcerias', 'Paciência', 'Cooperação', 'Sensibilidade'],
    3: ['Comunicação', 'Criatividade', 'Expansão', 'Alegria'],
    4: ['Trabalho', 'Disciplina', 'Estrutura', 'Estabilidade'],
    5: ['Mudança', 'Liberdade', 'Aventura', 'Adaptação'],
    6: ['Família', 'Responsabilidade', 'Harmonia', 'Cuidado'],
    7: ['Introspecção', 'Sabedoria', 'Espiritualidade', 'Análise'],
    8: ['Prosperidade', 'Poder', 'Justiça', 'Realização'],
    9: ['Finalização', 'Compaixão', 'Transcendência', 'Desapego']
  };
  return themes[year] || [];
};

const getChallenges = (year: number): string[] => {
  const challenges: { [key: number]: string[] } = {
    1: ['Evitar egoísmo excessivo', 'Não agir por impulso', 'Aceitar ajuda dos outros', 'Finalizar pendências do ano 9'],
    2: ['Lidar com hipersensibilidade', 'Evitar dependência emocional', 'Ter paciência com o ritmo lento', 'Resolver conflitos familiares'],
    3: ['Manter o foco', 'Controlar ansiedade', 'Evitar dispersão', 'Cuidar da fertilidade (se não desejar filhos)'],
    4: ['Aceitar trabalho intenso', 'Evitar rigidez excessiva', 'Não resistir à rotina', 'Manter equilíbrio'],
    5: ['Lidar com instabilidade', 'Controlar ansiedade', 'Não resistir às mudanças', 'Evitar excessos'],
    6: ['Não se sobrecarregar', 'Equilibrar dar e receber', 'Resolver conflitos familiares', 'Evitar perfeccionismo'],
    7: ['Evitar isolamento excessivo', 'Não se perder em análises', 'Confiar na intuição', 'Aceitar o silêncio'],
    8: ['Manter ética e integridade', 'Não se obcecar por dinheiro', 'Equilibrar material e espiritual', 'Evitar autoritarismo'],
    9: ['Aceitar finalizações', 'Praticar desapego', 'Não iniciar grandes projetos', 'Deixar o passado ir']
  };
  return challenges[year] || [];
};

export default PersonalYearCalculator;
