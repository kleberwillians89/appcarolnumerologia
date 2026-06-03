import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonalYearCalculator from './PersonalYearCalculator';
import { CompatibilitySection } from './CompatibilitySection';
import { NumerologySection } from './NumerologySection';
import { SavedProfilesPage } from './SavedProfilesPage';
import QuarterCycleTestPanel from './QuarterCycleTestPanel';
import { DEV_MODE } from '@/config/devMode';
import { DeliveriesPage } from './DeliveriesPage';
import { SettingsPage } from './SettingsPage';


type AppTab = 'numerology' | 'personalYear' | 'profiles' | 'deliveries' | 'settings' | 'compatibility' | 'tests';

const productionTabs: Array<{ id: AppTab; label: string }> = [
  { id: 'numerology', label: 'Mapa da Alma' },
  { id: 'personalYear', label: 'Ano Pessoal' },
  { id: 'profiles', label: 'Perfis' },
  { id: 'deliveries', label: 'Entregas' },
  { id: 'settings', label: 'Configurações' },
];

const devTabs: Array<{ id: AppTab; label: string }> = DEV_MODE
  ? [
      { id: 'compatibility', label: 'Compatibilidade' },
      { id: 'tests', label: 'Testes' },
    ]
  : [];

const navTabs = [...productionTabs, ...devTabs];



const AppLayout: React.FC = () => {
  const {
    user,
    profile,
    loading,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AppTab>('numerology');

  const handleLogout = async () => {
    const logoutPromise = logout();
    navigate('/login', { replace: true });
    await logoutPromise;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        Carregando plataforma...
      </div>
    );
  }

  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* Hero Section com imagem */}
      <div className="relative h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden">
        <img src="https://d64gsuwffb70l.cloudfront.net/6877ab8bbdf6db9dc0251519_1760715868361_5e2fb5cd.png" alt="Carol Graber Numerologia" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
      </div>
      
      <div className="relative z-10 -mt-16 sm:-mt-24 md:-mt-32">
        <nav className="bg-slate-800/80 backdrop-blur-lg border-b border-yellow-500/20">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Carol Graber</h1>
                <p className="text-yellow-500 text-xs sm:text-sm tracking-widest">NUMEROLOGIA</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-slate-300 text-xs sm:text-sm hidden sm:inline">{profile?.full_name || profile?.name || user?.email}</span>
                <button onClick={handleLogout} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold rounded-lg transition-colors text-xs sm:text-sm">Sair</button>
              </div>
            </div>
            
            {/* Navegação mobile com scroll horizontal */}
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
              <div className="flex gap-1.5 sm:gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-xs sm:text-sm ${
                      activeTab === tab.id
                        ? 'bg-yellow-500 text-slate-900'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          {activeTab === 'tests' ? (
            <QuarterCycleTestPanel />
          ) : activeTab === 'settings' ? (
            <SettingsPage />
          ) : activeTab === 'profiles' ? (
            <SavedProfilesPage />
          ) : activeTab === 'deliveries' ? (
            <DeliveriesPage />
          ) : activeTab === 'compatibility' ? (
            <CompatibilitySection />
          ) : activeTab === 'personalYear' ? (
            <PersonalYearCalculator />
          ) : (
            <NumerologySection />
          )}
        </div>

      </div>
    </div>;

};
export default AppLayout;
