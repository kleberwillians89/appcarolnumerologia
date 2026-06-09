export type ProfilePdfStatus = 'PENDENTE' | 'EM_ANALISE' | 'PDF_GERADO' | 'ENVIADO' | 'ERRO';

export interface SavedProfile {
  id: string;
  profileName: string;
  name: string;
  birthDate: string;
  phone?: string;
  email?: string;
  timestamp: number;
  lastModified: number;
  type: 'numerology' | 'compatibility' | 'personalYear';
  data: any;
  results?: any;
  notes?: string;
  favorite?: boolean;
  tags?: string[];
  pdfStatus?: ProfilePdfStatus;
  pdfDataUrl?: string | null;
  pdfFileName?: string | null;
  pdfGeneratedAt?: string | null;
  pdfSentAt?: string | null;
  pdfError?: string | null;
  pdfPublicUrl?: string | null;
  pdfStoragePath?: string | null;
  shareId?: string | null;
  shareUrl?: string | null;
  sharedAt?: string | null;
}

const PROFILES_KEY = 'saved_numerology_profiles';
const TAGS_KEY = 'profile_tags';

// Gerenciamento de tags disponíveis
export const getAvailableTags = (): string[] => {
  try {
    const stored = localStorage.getItem(TAGS_KEY);
    return stored ? JSON.parse(stored) : ['Família', 'Trabalho', 'Amigos'];
  } catch {
    return ['Família', 'Trabalho', 'Amigos'];
  }
};

export const addAvailableTag = (tag: string): void => {
  const tags = getAvailableTags();
  if (!tags.includes(tag)) {
    tags.push(tag);
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
    window.dispatchEvent(new CustomEvent('tagsUpdated'));
  }
};

export const removeAvailableTag = (tag: string): void => {
  const tags = getAvailableTags().filter(t => t !== tag);
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  window.dispatchEvent(new CustomEvent('tagsUpdated'));
};



export const saveProfile = (profile: Omit<SavedProfile, 'id' | 'timestamp' | 'lastModified'> | SavedProfile): SavedProfile => {
  const profiles = getProfiles();
  
  // Se o perfil já tem ID, é uma restauração de backup
  if ('id' in profile && profile.id) {
    const existingProfile = profile as SavedProfile;
    profiles.unshift(existingProfile);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('profilesUpdated'));
    
    return existingProfile;
  }
  
  // Caso contrário, criar novo perfil
  const newProfile: SavedProfile = {
    ...profile,
    id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    lastModified: Date.now(),
  };
  profiles.unshift(newProfile);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('profilesUpdated'));
  
  return newProfile;
};



export const getProfiles = (): SavedProfile[] => {
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const updateProfile = (id: string, updates: Partial<SavedProfile>): void => {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === id);
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updates, lastModified: Date.now() };
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('profilesUpdated'));
  }
};


export const deleteProfile = (id: string): void => {
  const profiles = getProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(filtered));
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('profilesUpdated'));
};


export const toggleFavorite = (id: string): void => {
  const profiles = getProfiles();
  const profile = profiles.find(p => p.id === id);
  if (profile) {
    updateProfile(id, { favorite: !profile.favorite });
  }
};

export const exportProfiles = (): string => {
  const profiles = getProfiles();
  return JSON.stringify({ profiles, exportDate: new Date().toISOString() }, null, 2);
};

export const importProfiles = (jsonData: string): { success: boolean; count: number; error?: string } => {
  try {
    const data = JSON.parse(jsonData);
    if (!data.profiles || !Array.isArray(data.profiles)) {
      return { success: false, count: 0, error: 'Formato inválido' };
    }
    const existingProfiles = getProfiles();
    const merged = [...data.profiles, ...existingProfiles];
    localStorage.setItem(PROFILES_KEY, JSON.stringify(merged));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('profilesUpdated'));
    
    return { success: true, count: data.profiles.length };
  } catch (error) {
    return { success: false, count: 0, error: 'Erro ao processar arquivo' };
  }
};

export const clearAllProfiles = (): void => {
  localStorage.removeItem(PROFILES_KEY);
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('profilesUpdated'));
};
