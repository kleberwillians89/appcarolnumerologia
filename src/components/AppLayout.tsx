import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import PersonalYearCalculator from './PersonalYearCalculator';
import { CompatibilitySection } from './CompatibilitySection';
import { NumerologySection } from './NumerologySection';
import { SavedProfilesPage } from './SavedProfilesPage';
import QuarterCycleTestPanel from './QuarterCycleTestPanel';
import { DEV_MODE } from '@/config/devMode';
import { SettingsPage } from './SettingsPage';
import { AcquisitionPage } from './AcquisitionPage';
import { DeliveriesPage } from './DeliveriesPage';

type AppTab =
  | 'deliveries'
  | 'numerology'
  | 'personalYear'
  | 'profiles'
  | 'acquisition'
  | 'settings'
  | 'compatibility'
  | 'tests';

interface AppLayoutProps {
  initialTab?: AppTab;
}

const productionTabs: Array<{ id: AppTab; label: string }> = [
  { id: 'deliveries', label: 'Entregas' },
  { id: 'numerology', label: 'Mapa da Alma' },
  { id: 'personalYear', label: 'Ano Pessoal' },
  { id: 'profiles', label: 'Perfis' },
  { id: 'acquisition', label: 'Aquisição' },
  { id: 'settings', label: 'Configurações' },
];

const devTabs: Array<{ id: AppTab; label: string }> = DEV_MODE
  ? [
      { id: 'compatibility', label: 'Compatibilidade' },
      { id: 'tests', label: 'Testes' },
    ]
  : [];

const AppLayout: React.FC<AppLayoutProps> = ({ initialTab = 'deliveries' }) => {
  const { user, profile, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);

  const navTabs = isAdmin ? [...productionTabs, ...devTabs] : [];

  const handleLogout = async () => {
    const logoutPromise = logout();
    navigate('/login', { replace: true });
    await logoutPromise;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050B1A] px-4 text-center text-[#F8F5EF]">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B1A] text-[#F8F5EF]">
      <header className="sticky top-0 z-30 border-b border-[#C9A96E]/20 bg-[#071D2B]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.28em] text-[#C9A96E]">CAROL GRABER</p>
              <h1 className="truncate text-xl font-bold text-white sm:text-2xl">Centro de Comando</h1>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="min-w-0 text-right text-xs text-[#F8F5EF]/65 sm:text-sm">
                <p className="truncate text-[#F8F5EF]">{profile?.full_name || profile?.name || user?.email}</p>
                <p>Admin</p>
              </div>
              <Button
                variant="outline"
                className="h-10 shrink-0 border-[#F8F5EF]/25 bg-transparent px-3 text-[#F8F5EF] hover:bg-[#F8F5EF]/10 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>

          <nav className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <div className="flex min-w-max gap-2">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-10 rounded-md px-4 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#C9A96E] text-[#050B1A]'
                      : 'border border-[#F8F5EF]/10 bg-[#0B1426] text-[#F8F5EF]/75 hover:border-[#C9A96E]/35 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl px-4 py-5 lg:px-6 lg:py-6">
        {activeTab === 'deliveries' ? (
          <DeliveriesPage />
        ) : activeTab === 'settings' ? (
          <SettingsPage />
        ) : activeTab === 'profiles' ? (
          <SavedProfilesPage />
        ) : activeTab === 'acquisition' ? (
          <AcquisitionPage />
        ) : activeTab === 'compatibility' ? (
          <CompatibilitySection />
        ) : activeTab === 'tests' ? (
          <QuarterCycleTestPanel />
        ) : activeTab === 'personalYear' ? (
          <PersonalYearCalculator />
        ) : (
          <NumerologySection />
        )}
      </main>
    </div>
  );
};

export default AppLayout;
