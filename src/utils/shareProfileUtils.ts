// Utility functions for profile sharing

export interface SharedProfile {
  id: string;
  profile: any;
  sharedAt: string;
  expiresAt?: string;
}

// Generate unique share ID
export const generateShareId = (profile: any): string => {
  const data = JSON.stringify(profile);
  const timestamp = Date.now();
  const hash = simpleHash(data + timestamp);
  return hash.substring(0, 12);
};

// Simple hash function
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Save shared profile
export const saveSharedProfile = (profile: any): string => {
  const shareId = generateShareId(profile);
  const sharedProfile: SharedProfile = {
    id: shareId,
    profile,
    sharedAt: new Date().toISOString(),
  };
  
  const existing = getSharedProfiles();
  existing[shareId] = sharedProfile;
  localStorage.setItem('sharedProfiles', JSON.stringify(existing));
  
  return shareId;
};

// Get all shared profiles
export const getSharedProfiles = (): Record<string, SharedProfile> => {
  const data = localStorage.getItem('sharedProfiles');
  return data ? JSON.parse(data) : {};
};

// Get specific shared profile
export const getSharedProfile = (id: string): SharedProfile | null => {
  const profiles = getSharedProfiles();
  return profiles[id] || null;
};

// Generate share URL
export const generateShareUrl = (shareId: string): string => {
  return `${window.location.origin}/shared/${shareId}`;
};

// Generate QR Code URL
export const generateQRCodeUrl = (shareUrl: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
};
