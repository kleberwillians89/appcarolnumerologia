import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Star, Trash2, Shield, Tag } from 'lucide-react';
import { ProfileCard } from './ProfileCard';
import { ExportImportModal } from './ExportImportModal';
import { EditProfileModal } from './EditProfileModal';
import { ShareProfileModal } from './ShareProfileModal';
import { BackupManager } from './BackupManager';
import { Badge } from '@/components/ui/badge';
import { getProfiles, deleteProfile, toggleFavorite, clearAllProfiles, updateProfile, SavedProfile, saveProfile, getAvailableTags } from '@/utils/profileStorage';
import { saveSharedProfile, generateShareUrlForProfile, generateQRCodeUrl } from '@/utils/shareProfileUtils';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';



import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const SavedProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<SavedProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<SavedProfile | null>(null);
  const [sharingProfile, setSharingProfile] = useState<{ profile: SavedProfile; shareUrl: string; qrCodeUrl: string } | null>(null);
  const { setNumerologyState } = useAppContext();
  const { toast } = useToast();



  const loadProfiles = () => {
    const loaded = getProfiles();
    setProfiles(loaded);
    setFilteredProfiles(loaded);
  };

  useEffect(() => {
    loadProfiles();
  }, []);


  useEffect(() => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(p => p.favorite);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags && p.tags.some(tag => selectedTags.includes(tag))
      );
    }

    setFilteredProfiles(filtered);
  }, [searchTerm, filterType, showFavoritesOnly, selectedTags, profiles]);


  const handleLoadProfile = (profile: SavedProfile) => {
    if (profile.type === 'numerology') {
      setNumerologyState({
        results: profile.results,
        userData: { name: profile.name, birthDate: profile.birthDate },
        lifeCycles: profile.data.lifeCycles,
        challenges: profile.data.challenges,
        presents: profile.data.presents || [],
      });
      toast({ title: 'Perfil carregado', description: `${profile.profileName} foi carregado com sucesso! Vá para a aba "Mapa Numerológico" para ver os resultados.` });
    }
  };


  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
    loadProfiles();
    toast({ title: 'Perfil excluído', description: 'O perfil foi removido com sucesso.' });
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    loadProfiles();
  };
  const handleEditProfile = (profile: SavedProfile) => {
    setEditingProfile(profile);
  };

  const handleSaveEdit = (id: string, updates: Partial<SavedProfile>) => {
    updateProfile(id, updates);
    loadProfiles();
    toast({ title: 'Perfil atualizado', description: 'As alterações foram salvas com sucesso.' });
  };

  const handleClearAll = () => {
    clearAllProfiles();
    loadProfiles();
    setShowClearDialog(false);
    toast({ title: 'Perfis limpos', description: 'Todos os perfis foram removidos.' });
  };

  const handleRestoreBackup = (restoredProfiles: SavedProfile[]) => {
    // Limpar perfis atuais
    clearAllProfiles();
    
    // Restaurar perfis do backup
    restoredProfiles.forEach(profile => {
      saveProfile(profile);
    });
    
    loadProfiles();
    toast({ 
      title: 'Backup restaurado', 
      description: `${restoredProfiles.length} perfis foram restaurados com sucesso.`,
      duration: 5000
    });
  };

  const handleShareProfile = (profile: SavedProfile) => {
    if (!profile.pdfPublicUrl) {
      toast({
        title: 'PDF público necessário',
        description: 'Gere o PDF e aguarde o upload público antes de compartilhar.',
        variant: 'destructive',
      });
      return;
    }

    const shareId = profile.shareId || saveSharedProfile(profile);
    const shareUrl = profile.shareUrl || generateShareUrlForProfile(shareId, profile);
    updateProfile(profile.id, { shareId, shareUrl, sharedAt: profile.sharedAt || new Date().toISOString() });
    const qrCodeUrl = generateQRCodeUrl(shareUrl);
    setSharingProfile({ profile: { ...profile, shareId, shareUrl }, shareUrl, qrCodeUrl });
    loadProfiles();
    toast({ title: 'Link gerado!', description: 'Compartilhe seu perfil com outras pessoas.' });
  };

  const availableTags = getAvailableTags();

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };





  return (

    <div className="container mx-auto px-4 py-8 max-w-7xl text-slate-100">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Meus Perfis Salvos</h1>
        <p className="text-slate-300">Gerencie e acesse seus cálculos numerológicos salvos</p>
      </div>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-slate-900/70 text-slate-300">
          <TabsTrigger value="profiles" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-slate-950">Perfis</TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-slate-950">
            <Shield className="w-4 h-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar perfis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-950/70 border-slate-700 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-slate-950/70 border-slate-700 text-slate-100">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-700 text-slate-100">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="numerology">Numerologia</SelectItem>
                <SelectItem value="compatibility">Compatibilidade</SelectItem>
                <SelectItem value="personalYear">Ano Pessoal</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={showFavoritesOnly ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 'border-slate-600 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white'}
            >
              <Star className="w-4 h-4 mr-2" />
              Favoritos
            </Button>
          </div>

          {availableTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Filtrar por tags:</span>
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className={selectedTags.includes(tag) ? 'cursor-pointer bg-yellow-500 text-slate-950' : 'cursor-pointer border-slate-600 text-slate-200'}
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white" onClick={() => setShowExportImport(true)}>
              <Download className="w-4 h-4 mr-2" />
              Exportar/Importar
            </Button>
            <Button variant="outline" className="border-slate-600 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white disabled:text-slate-500" onClick={() => setShowClearDialog(true)} disabled={profiles.length === 0}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos
            </Button>
          </div>

          {filteredProfiles.length === 0 ? (

            <div className="text-center py-12 text-slate-300">
              <p className="text-lg text-slate-100">Nenhum perfil encontrado</p>
              <p className="text-sm mt-2 text-slate-400">Salve seus cálculos para acessá-los rapidamente depois</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProfiles.map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onLoad={handleLoadProfile}
                  onDelete={handleDeleteProfile}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={handleEditProfile}
                  onShare={handleShareProfile}
                  onUpdate={handleSaveEdit}
                />

              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="backup">
          <BackupManager profiles={profiles} onRestore={handleRestoreBackup} />
        </TabsContent>
      </Tabs>


      <EditProfileModal
        open={!!editingProfile}
        onClose={() => setEditingProfile(null)}
        profile={editingProfile}
        onSave={handleSaveEdit}
      />

      <ShareProfileModal
        isOpen={!!sharingProfile}
        onClose={() => setSharingProfile(null)}
        shareUrl={sharingProfile?.shareUrl || ''}
        qrCodeUrl={sharingProfile?.qrCodeUrl || ''}
      />

      <ExportImportModal
        open={showExportImport}
        onClose={() => setShowExportImport(false)}
        onImportSuccess={loadProfiles}
      />


      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os perfis salvos serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
