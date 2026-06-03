import { SavedProfile } from './profileStorage';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'numerology' | 'compatibility' | 'personalYear';
  name: string;
  birthDate: string;
  data: any;
  results?: any;
}

export interface NumerologyHistoryEntry extends HistoryEntry {}

export interface BackupHistoryEntry {
  id: string;
  timestamp: number;
  date: string;
  profileCount: number;
  fileSize: number;
  profiles: SavedProfile[];
  version: string;
}

const STORAGE_KEY = 'numerology_history';
const BACKUP_HISTORY_KEY = 'numerology_backup_history';

export const saveToHistory = (entry: Omit<NumerologyHistoryEntry, 'id' | 'timestamp'>): void => {
  const history = getHistory();
  const newEntry: NumerologyHistoryEntry = {
    ...entry,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  history.unshift(newEntry);
  const trimmedHistory = history.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
};

export const getHistory = (): NumerologyHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const loadHistory = getHistory;

export const deleteFromHistory = (id: string): void => {
  const history = getHistory();
  const filtered = history.filter(entry => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Backup History Functions
export const saveBackupToHistory = (profiles: SavedProfile[]): BackupHistoryEntry => {
  const history = getBackupHistory();
  const dataString = JSON.stringify(profiles);
  const fileSize = new Blob([dataString]).size;
  
  const newEntry: BackupHistoryEntry = {
    id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    date: new Date().toISOString(),
    profileCount: profiles.length,
    fileSize,
    profiles,
    version: '1.0',
  };
  
  history.unshift(newEntry);
  const trimmedHistory = history.slice(0, 30);
  localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(trimmedHistory));
  return newEntry;
};

export const getBackupHistory = (): BackupHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(BACKUP_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const deleteBackupFromHistory = (id: string): void => {
  const history = getBackupHistory();
  const filtered = history.filter(entry => entry.id !== id);
  localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(filtered));
};

export const clearBackupHistory = (): void => {
  localStorage.removeItem(BACKUP_HISTORY_KEY);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};
