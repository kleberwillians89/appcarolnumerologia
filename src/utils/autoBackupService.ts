import { SavedProfile } from './profileStorage';


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

export const getBackupConfig = (): BackupConfig => {
  const stored = localStorage.getItem(BACKUP_CONFIG_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    enabled: true,
    intervalDays: 7,
    maxProfilesBeforeBackup: 10,
    lastBackupDate: null,
    lastBackupProfileCount: 0,
  };
};

export const saveBackupConfig = (config: BackupConfig): void => {
  localStorage.setItem(BACKUP_CONFIG_KEY, JSON.stringify(config));
};

export const shouldAutoBackup = (profiles: SavedProfile[]): boolean => {
  const config = getBackupConfig();
  if (!config.enabled) return false;

  const profileCount = profiles.length;
  
  // Check profile count threshold
  if (profileCount >= config.maxProfilesBeforeBackup && 
      profileCount > config.lastBackupProfileCount) {
    return true;
  }

  // Check date threshold
  if (config.lastBackupDate) {
    const lastBackup = new Date(config.lastBackupDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= config.intervalDays) {
      return true;
    }
  } else {
    return true; // First backup
  }

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
  
  // Save to backup history
  const { saveBackupToHistory } = require('./historyStorage');
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
