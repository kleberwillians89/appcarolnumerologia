import React, { useState, useEffect } from 'react';
import { getProfiles, SavedProfile } from '../utils/profileStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { User } from 'lucide-react';

interface ProfileSelectorProps {
  onSelect: (profile: SavedProfile | null) => void;
  filterType?: 'numerology' | 'compatibility' | 'personalYear';
  label?: string;
  placeholder?: string;
  tone?: 'light' | 'dark';
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  onSelect,
  filterType,
  label = 'Carregar Perfil Salvo',
  placeholder = 'Selecione um perfil...',
  tone = 'light'
}) => {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);

  useEffect(() => {
    loadProfiles();
    
    // Listen for profile updates
    const handleProfilesUpdate = () => loadProfiles();
    window.addEventListener('profilesUpdated', handleProfilesUpdate);
    
    return () => {
      window.removeEventListener('profilesUpdated', handleProfilesUpdate);
    };
  }, [filterType]);

  const loadProfiles = () => {
    const allProfiles = getProfiles();
    
    // Se não há filtro, mostra todos os perfis
    // Se há filtro, mostra apenas perfis do tipo especificado OU sem tipo definido
    const filtered = filterType 
      ? allProfiles.filter(p => p.type === filterType || !p.type)
      : allProfiles;

    setProfiles(filtered);
  };

  const handleSelect = (profileId: string) => {
    if (profileId === 'none') {
      onSelect(null);
      return;
    }
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      onSelect(profile);
    }
  };

  return (
    <div className="space-y-2 flex-1">
      <Label className={`flex items-center gap-2 ${tone === 'dark' ? 'text-purple-100' : 'text-slate-800'}`}>
        <User className="w-4 h-4" />
        {label} {profiles.length > 0 && `(${profiles.length} disponíveis)`}
      </Label>
      <Select onValueChange={handleSelect}>
        <SelectTrigger className={tone === 'dark' ? 'border-white/20 bg-white/10 text-white placeholder:text-purple-200' : 'bg-white text-slate-900'}>
          <SelectValue placeholder={profiles.length === 0 ? 'Nenhum perfil salvo' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhum (limpar)</SelectItem>
          {profiles.map(profile => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.profileName} - {new Date(profile.timestamp).toLocaleDateString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
