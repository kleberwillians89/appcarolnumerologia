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

export const encodeSharePayload = (payload: unknown): string => {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
};

export const decodeSharePayload = <T = any>(payload: string): T | null => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  } catch {
    return null;
  }
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
  return `${window.location.origin}${window.location.pathname}#/shared/${shareId}`;
};

export const generateShareUrlForProfile = (shareId: string, profile: any): string => {
  const compactProfile = {
    userData: {
      name: profile.name,
      birthDate: profile.birthDate,
    },
    productName: profile.productName || profile.profileName || profile.name,
    pdfPublicUrl: profile.pdfPublicUrl,
    pdfFileName: profile.pdfFileName,
    materials: profile.materials || [],
    results: profile.results,
  };

  return `${generateShareUrl(shareId)}?payload=${encodeURIComponent(encodeSharePayload(compactProfile))}`;
};

// Generate QR Code URL
export const generateQRCodeUrl = (shareUrl: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
};
