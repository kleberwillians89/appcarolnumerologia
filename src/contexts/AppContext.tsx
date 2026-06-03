import React, { createContext, useContext, useState } from 'react';
import { saveToHistory } from '../utils/historyStorage';

interface NumerologyState {
  results: any | null;
  userData: { name: string; birthDate: string; phone?: string; email?: string; } | null;
  lifeCycles: any | null;
  challenges: any | null;
  presents: number[];
}

interface CompatibilityState {
  result: any | null;
  relationshipType: 'romantic' | 'business' | 'friendship';
}

interface PersonalYearState {
  day: string;
  month: string;
  birthMonth: number;
  personalYear: number | null;
  showResults: boolean;
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  birthDate: string;
  setBirthDate: (date: string) => void;
  numerologyState: NumerologyState;
  setNumerologyState: (state: NumerologyState) => void;
  compatibilityState: CompatibilityState;
  setCompatibilityState: (state: CompatibilityState) => void;
  personalYearState: PersonalYearState;
  setPersonalYearState: (state: PersonalYearState) => void;
  saveNumerologyToHistory: (name: string, birthDate: string, data: any) => void;
  saveCompatibilityToHistory: (name: string, birthDate: string, data: any) => void;
  savePersonalYearToHistory: (name: string, birthDate: string, data: any) => void;
}


const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  birthDate: '',
  setBirthDate: () => {},
  numerologyState: { results: null, userData: null, lifeCycles: null, challenges: null, presents: [] },
  setNumerologyState: () => {},
  compatibilityState: { result: null, relationshipType: 'romantic' },
  setCompatibilityState: () => {},
  personalYearState: { day: '', month: '', birthMonth: 0, personalYear: null, showResults: false },
  setPersonalYearState: () => {},
  saveNumerologyToHistory: () => {},
  saveCompatibilityToHistory: () => {},
  savePersonalYearToHistory: () => {},
};


const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [numerologyState, setNumerologyState] = useState<NumerologyState>({ 
    results: null, userData: null, lifeCycles: null, challenges: null, presents: [] 
  });
  const [compatibilityState, setCompatibilityState] = useState<CompatibilityState>({ 
    result: null, relationshipType: 'romantic' 
  });
  const [personalYearState, setPersonalYearState] = useState<PersonalYearState>({ 
    day: '', month: '', birthMonth: 0, personalYear: null, showResults: false 
  });

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const saveNumerologyToHistory = (name: string, birthDate: string, data: any) => {
    saveToHistory({ type: 'numerology', name, birthDate, data });
  };

  const saveCompatibilityToHistory = (name: string, birthDate: string, data: any) => {
    saveToHistory({ type: 'compatibility', name, birthDate, data });
  };

  const savePersonalYearToHistory = (name: string, birthDate: string, data: any) => {
    saveToHistory({ type: 'personalYear', name, birthDate, data });
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        birthDate,
        setBirthDate,
        numerologyState,
        setNumerologyState,
        compatibilityState,
        setCompatibilityState,
        personalYearState,
        setPersonalYearState,
        saveNumerologyToHistory,
        saveCompatibilityToHistory,
        savePersonalYearToHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
