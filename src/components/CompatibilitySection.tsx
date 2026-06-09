import { useState, useEffect, useMemo } from 'react';
import { getProfiles, SavedProfile } from '@/utils/profileStorage';
import { CompatibilityResults } from './CompatibilityResults';
import { calculateCompatibility, CompatibilityResult } from '../utils/compatibilityCalculations';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Heart, Briefcase, Users, UserPlus, AlertCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { formatDateBR } from '@/utils/dateUtils';
import { CreateProfileModal } from './CreateProfileModal';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import ProfileFilters, { SortOption, ViewMode } from '@/components/ProfileFilters';
import ProfileSelectionCard from '@/components/ProfileSelectionCard';
import { useToast } from '@/hooks/use-toast';

export const CompatibilitySection = () => {
  const { toast } = useToast();
  const { numerologyState, compatibilityState, setCompatibilityState, saveCompatibilityToHistory } = useAppContext();
  
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(compatibilityState.result);
  const [relationshipType, setRelationshipType] = useState<'romantic' | 'business' | 'friendship'>(compatibilityState.relationshipType);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const mainProfile = useMemo(() => {
    if (!numerologyState.results || !numerologyState.userData) return null;
    
    const [year, month, day] = numerologyState.userData.birthDate.split('-');
    return {
      id: 'main_profile',
      profileName: `${numerologyState.userData.name} (Perfil Principal)`,
      name: numerologyState.userData.name,
      birthDate: numerologyState.userData.birthDate,
      type: 'numerology' as const,
      timestamp: Date.now(),
      lastModified: Date.now(),
      results: {
        ...numerologyState.results,
        day: parseInt(day),
        month: parseInt(month),
        year: parseInt(year)
      },
      data: {
        numerology: numerologyState.results,
        day: parseInt(day),
        month: parseInt(month),
        year: parseInt(year)
      }
    };
  }, [numerologyState]);

  const loadProfiles = () => {
    const allProfiles = getProfiles();
    setProfiles(allProfiles);
  };

  useEffect(() => {
    loadProfiles();
    const handleProfilesUpdate = () => loadProfiles();
    window.addEventListener('profilesUpdated', handleProfilesUpdate);
    return () => window.removeEventListener('profilesUpdated', handleProfilesUpdate);
  }, []);

  useEffect(() => {
    if (compatibilityState.result) {
      setCompatibilityResult(compatibilityState.result);
      setRelationshipType(compatibilityState.relationshipType);
    }
  }, []);

  const filteredProfiles = useMemo(() => {
    let filtered = [...profiles];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.profileName.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)
      );
    }
    if (showFavoritesOnly) filtered = filtered.filter(p => p.favorite);
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags && p.tags.some(tag => selectedTags.includes(tag))
      );
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.timestamp - a.timestamp;
        case 'oldest': return a.timestamp - b.timestamp;
        case 'alphabetical': return a.profileName.localeCompare(b.profileName);
        default: return 0;
      }
    });
    return filtered;
  }, [profiles, searchTerm, sortBy, showFavoritesOnly, selectedTags]);

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfileId(selectedProfileId === profileId ? null : profileId);
  };

  const handleProfileCreated = (profile: any) => {
    setProfiles(prev => [profile, ...prev]);
    setSelectedProfileId(profile.id);
    toast({ title: "Perfil Criado", description: `${profile.name} selecionado para compatibilidade` });
  };

  const handleCalculate = () => {
    if (!numerologyState?.userData || !selectedProfileId) return;

    const selectedProfile = profiles.find(p => p.id === selectedProfileId);
    if (!selectedProfile) return;

    const [year1, month1, day1] = numerologyState.userData.birthDate.split('-');
    const p1 = {
      name: numerologyState.userData.name,
      day: parseInt(day1),
      month: parseInt(month1),
      year: parseInt(year1)
    };

    const [year2, month2, day2] = selectedProfile.birthDate.split('-');
    const p2 = {
      name: selectedProfile.name,
      day: parseInt(day2),
      month: parseInt(month2),
      year: parseInt(year2)
    };

    const result = calculateCompatibility(p1, p2);
    setCompatibilityResult(result);
    
    setCompatibilityState({
      result,
      relationshipType,
    });

    saveCompatibilityToHistory(p1, p2, result, relationshipType);
  };

  const handleReset = () => {
    setCompatibilityResult(null);
    setSelectedProfileId(null);
    setCompatibilityState({
      result: null,
      relationshipType: 'romantic',
    });
  };

  const relationshipOptions = [
    { value: 'romantic', label: 'Romântico', icon: Heart },
    { value: 'business', label: 'Negócios', icon: Briefcase },
    { value: 'friendship', label: 'Amizade', icon: Users }
  ];

  if (!numerologyState?.userData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert className="bg-yellow-500/10 border-yellow-500/50">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            Você precisa calcular seu perfil numerológico primeiro na aba "Números Essenciais" antes de usar a análise de compatibilidade.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!compatibilityResult ? (
        <>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Compatibilidade Numerológica</h2>
            <p className="text-slate-300">Analise a compatibilidade com outra pessoa</p>
          </div>

          {mainProfile && (
            <Card className="bg-purple-900/30 border-purple-500/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm mb-1">Perfil Principal</p>
                    <p className="text-white font-semibold text-lg">{mainProfile.name}</p>
                    <p className="text-purple-300 text-sm">{formatDateBR(mainProfile.birthDate)}</p>
                  </div>
                  <Badge className="bg-purple-500">Base</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Tipo de Relacionamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {relationshipOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setRelationshipType(option.value as any)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        relationshipType === option.value
                          ? 'bg-purple-500 border-purple-400 text-white'
                          : 'bg-white/5 border-white/20 text-purple-200 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-semibold">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <ProfileFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            totalProfiles={profiles.length}
            filteredCount={filteredProfiles.length}
          />

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-purple-500" />
                  Selecionar Perfil para Compatibilidade
                </div>
                <Button onClick={() => setShowCreateModal(true)} variant="outline" size="sm" className="border-purple-500/50 bg-slate-900/30 text-purple-200 hover:bg-slate-800 hover:text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Novo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-300">Nenhum perfil salvo</p>
                  <Button onClick={() => setShowCreateModal(true)} className="mt-4 bg-purple-500 hover:bg-purple-600 text-white">
                    Criar Primeiro Perfil
                  </Button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                  {filteredProfiles.map(profile => (
                    <ProfileSelectionCard
                      key={profile.id}
                      profile={profile}
                      isSelected={selectedProfileId === profile.id}
                      onSelect={() => handleProfileSelect(profile.id)}
                      viewMode={viewMode}
                      onFavoriteToggle={() => {}}
                    />
                  ))}
                </div>
              )}
              <Button 
                className="mt-6 w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold" 
                disabled={!selectedProfileId}
                onClick={handleCalculate}
              >
                {!selectedProfileId ? 'Selecione um perfil' : 'Analisar Compatibilidade'}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <CompatibilityResults result={compatibilityResult} relationshipType={relationshipType} />
          
          <div className="flex justify-center mt-6">
            <Button onClick={handleReset} className="bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white border border-white/20">
              🔄 Nova Análise
            </Button>
          </div>
        </>
      )}

      <CreateProfileModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProfileCreated={handleProfileCreated}
        title="Criar Perfil para Compatibilidade"
      />
    </div>
  );
};
