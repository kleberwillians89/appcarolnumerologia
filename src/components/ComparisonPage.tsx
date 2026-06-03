import { useState, useEffect, useMemo } from 'react';
import { getProfiles, SavedProfile } from '@/utils/profileStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Download, UserPlus, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { generateMapaDaAlmaWithComparison } from '@/utils/mapaDaAlmaPdfWithComparison';
import { generateMultiProfilePDF } from '@/utils/multiProfilePdfGenerator';
import { useAppContext } from '@/contexts/AppContext';
import { formatDateBR } from '@/utils/dateUtils';

import ProfileFilters, { SortOption, ViewMode } from '@/components/ProfileFilters';
import ProfileSelectionCard from '@/components/ProfileSelectionCard';
import NumbersComparison from '@/components/comparison/NumbersComparison';
import CompatibilityAnalysis from '@/components/comparison/CompatibilityAnalysis';
import CyclesComparison from '@/components/comparison/CyclesComparison';
import ChallengesComparison from '@/components/comparison/ChallengesComparison';
import ComparisonRadarChart from '@/components/charts/ComparisonRadarChart';
import ComparisonBarChart from '@/components/charts/ComparisonBarChart';
import MultiProfileTable from '@/components/comparison/MultiProfileTable';
import { CreateProfileModal } from './CreateProfileModal';

export default function ComparisonPage() {
  const { toast } = useToast();
  const { numerologyState } = useAppContext();
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Perfil principal do contexto
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

  const handleSelect = (profileId: string) => {
    if (selected.includes(profileId)) {
      setSelected(selected.filter(id => id !== profileId));
    } else if (selected.length < 5) {
      setSelected([...selected, profileId]);
    } else {
      toast({ title: "Limite", description: "Máximo 5 perfis para comparar", variant: "destructive" });
    }
  };

  const handleProfileCreated = (profile: any) => {
    setProfiles(prev => [profile, ...prev]);
    if (selected.length < 5) {
      setSelected(prev => [...prev, profile.id]);
    }
    toast({ title: "Perfil Criado", description: `${profile.name} adicionado à comparação` });
  };

  const handleExportPDF = async () => {
    if (!mainProfile) {
      toast({ title: "Erro", description: "Calcule um perfil principal primeiro", variant: "destructive" });
      return;
    }

    const comparisonProfiles = selected.map(id => profiles.find(p => p.id === id)).filter(Boolean) as SavedProfile[];
    
    if (comparisonProfiles.length === 0) {
      toast({ title: "Erro", description: "Selecione pelo menos 1 perfil para comparar", variant: "destructive" });
      return;
    }

    setExportingPdf(true);
    try {
      await generateMapaDaAlmaWithComparison(mainProfile as SavedProfile, comparisonProfiles);
      toast({ title: "PDF Gerado", description: "Comparação exportada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao gerar PDF", variant: "destructive" });
    } finally {
      setExportingPdf(false);
    }
  };

  const allSelectedProfiles = mainProfile ? [mainProfile, ...selected.map(id => profiles.find(p => p.id === id)).filter(Boolean)] as SavedProfile[] : [];
  const canCompare = mainProfile && selected.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Comparação de Perfis</h2>
        <p className="text-slate-300">Compare seu perfil principal com outros perfis</p>
      </div>

      {!mainProfile && (
        <Card className="bg-yellow-900/30 border-yellow-500/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-semibold mb-1">Perfil Principal Necessário</p>
                <p className="text-yellow-300/80 text-sm">
                  Calcule seu perfil na página principal antes de fazer comparações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      <Card className="bg-slate-800/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-500" />
              Perfis para Comparar
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowCreateModal(true)} variant="outline" size="sm" className="border-yellow-500/50 text-yellow-500">
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Novo
              </Button>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">
                {selected.length}/5
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-300">Nenhum perfil salvo</p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                Criar Primeiro Perfil
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredProfiles.map(profile => (
                <ProfileSelectionCard
                  key={profile.id}
                  profile={profile}
                  isSelected={selected.includes(profile.id)}
                  onSelect={() => handleSelect(profile.id)}
                  viewMode={viewMode}
                  onFavoriteToggle={() => {}}
                />
              ))}
            </div>
          )}
          <Button 
            className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold" 
            disabled={!canCompare}
            onClick={() => setComparing(true)}
          >
            {!canCompare ? 'Selecione pelo menos 1 perfil' : `Comparar com ${selected.length} Perfil${selected.length > 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>

      {comparing && canCompare && (
        <>
          <div className="flex justify-end">
            <Button onClick={handleExportPDF} disabled={exportingPdf} className="bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              {exportingPdf ? 'Gerando...' : 'Baixar PDF'}
            </Button>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
              <TabsTrigger value="table">Tabela</TabsTrigger>
              <TabsTrigger value="numbers">Números</TabsTrigger>
              <TabsTrigger value="compatibility">Compatibilidade</TabsTrigger>
              <TabsTrigger value="cycles">Ciclos</TabsTrigger>
              <TabsTrigger value="charts">Gráficos</TabsTrigger>
            </TabsList>
            <TabsContent value="table"><MultiProfileTable profiles={allSelectedProfiles} /></TabsContent>
            <TabsContent value="numbers"><NumbersComparison profiles={allSelectedProfiles} highlightIdentical={true} showOnlyDifferences={false} /></TabsContent>
            <TabsContent value="compatibility">
              {allSelectedProfiles.length === 2 ? <CompatibilityAnalysis profile1={allSelectedProfiles[0]} profile2={allSelectedProfiles[1]} /> : 
              <p className="text-slate-300 text-center py-8">Disponível para 2 perfis</p>}
            </TabsContent>
            <TabsContent value="cycles"><CyclesComparison profiles={allSelectedProfiles} /></TabsContent>
            <TabsContent value="charts" className="space-y-8">
              <ComparisonRadarChart profiles={allSelectedProfiles} />
              <ComparisonBarChart profiles={allSelectedProfiles} />
            </TabsContent>
          </Tabs>
        </>
      )}

      <CreateProfileModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProfileCreated={handleProfileCreated}
        title="Criar Perfil para Comparação"
      />
    </div>
  );
}
