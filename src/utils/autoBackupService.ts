import { SavedProfile } from './profileStorage';
import { saveBackupToHistory } from './historyStorage';


export interface BackupConfig {
  enabled: boolean;
  intervalDays: number;
  maxProfilesBeforeBackup: number;
  lastBackupDate: string | null;
  lastBackupProfileCount: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  profileCount: number;
  profiles: SavedProfile[];
}


const BACKUP_CONFIG_KEY = 'numerology_backup_config';
const LAST_BACKUP_KEY = 'numerology_last_backup';

const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  enabled: false,
  intervalDays: 7,
  maxProfilesBeforeBackup: 10,
  lastBackupDate: null,
  lastBackupProfileCount: 0,
};

export const getBackupConfig = (): BackupConfig => {
  try {
    const stored = localStorage.getItem(BACKUP_CONFIG_KEY);
    if (stored) {
      return { ...DEFAULT_BACKUP_CONFIG, ...JSON.parse(stored), enabled: false };
    }
  } catch {
    localStorage.removeItem(BACKUP_CONFIG_KEY);
  }

  return DEFAULT_BACKUP_CONFIG;
};

export const saveBackupConfig = (config: BackupConfig): void => {
  localStorage.setItem(BACKUP_CONFIG_KEY, JSON.stringify({ ...config, enabled: false }));
};

export const shouldAutoBackup = (profiles: SavedProfile[]): boolean => {
  void profiles;
  return false;
};

export const createBackup = (profiles: SavedProfile[]): BackupData => {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    profileCount: profiles.length,
    profiles,
  };
};

export const downloadBackup = (profiles: SavedProfile[]): void => {
  const backup = createBackup(profiles);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `numerology_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Update config
  const config = getBackupConfig();
  config.lastBackupDate = new Date().toISOString();
  config.lastBackupProfileCount = profiles.length;
  saveBackupConfig(config);
  
  localStorage.setItem(LAST_BACKUP_KEY, JSON.stringify(backup));
  
  saveBackupToHistory(profiles);
};


export const parseBackupFile = (fileContent: string): BackupData | null => {
  try {
    const data = JSON.parse(fileContent);
    if (data.version && data.timestamp && data.profiles && Array.isArray(data.profiles)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
};
