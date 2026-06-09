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
import { getProfiles, deleteProfile, toggleFavorite, clearAllProfiles, updateProfile, SavedProfile, saveProfile, getAvailableTags, ProfilePdfStatus } from '@/utils/profileStorage';
import { saveSharedProfile, generateShareUrl, generateQRCodeUrl } from '@/utils/shareProfileUtils';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { downloadProfilePDF, generateProfilePDF } from '@/utils/profilePdfGenerator';



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
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const { setBirthDate, setNumerologyState, setPersonalYearState, setCompatibilityState } = useAppContext();
  const { toast } = useToast();



  const loadProfiles = () => {
    const loaded = getProfiles();
    setProfiles(loaded);
    setFilteredProfiles(loaded);
  };

  const replaceProfileInState = (updatedProfile: SavedProfile) => {
    setProfiles((currentProfiles) =>
      currentProfiles.map((profile) => (profile.id === updatedProfile.id ? updatedProfile : profile))
    );
  };

  const updateSavedProfile = (id: string, updates: Partial<SavedProfile>) => {
    const updatedProfile = updateProfile(id, updates);
    if (updatedProfile) {
      replaceProfileInState(updatedProfile);
      return updatedProfile;
    }

    loadProfiles();
    return null;
  };

  useEffect(() => {
    loadProfiles();
  }, []);


  useEffect(() => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        (p.profileName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        userData: { name: profile.name, birthDate: profile.birthDate, phone: profile.phone, email: profile.email },
        lifeCycles: profile.data?.lifeCycles || null,
        challenges: profile.data?.challenges || null,
        presents: profile.data?.presents || [],
      });
      setBirthDate(profile.birthDate);
      toast({ title: 'Perfil carregado', description: `${profile.profileName} foi carregado. Abra a aba Mapa da Alma para ver os resultados.` });
      return;
    }

    if (profile.type === 'personalYear') {
      const data = profile.data || {};
      setBirthDate(profile.birthDate);
      setPersonalYearState({
        day: String(data.day || ''),
        month: String(data.month || ''),
        birthMonth: Number(data.birthMonth || data.month || 0),
        personalYear: Number(data.personalYear || data.year || 0) || null,
        showResults: Boolean(data.personalYear || data.year),
      });
      toast({ title: 'Perfil carregado', description: `${profile.profileName} foi carregado. Abra a aba Ano Pessoal para ver os resultados.` });
      return;
    }

    if (profile.type === 'compatibility') {
      setCompatibilityState({
        result: profile.results || profile.data || null,
        relationshipType: profile.data?.relationshipType || 'romantic',
      });
      toast({ title: 'Perfil carregado', description: `${profile.profileName} foi carregado para compatibilidade.` });
      return;
    }

    toast({
      title: 'Perfil não carregado',
      description: 'Este tipo de perfil não possui uma visualização operacional disponível.',
      variant: 'destructive',
    });
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
    updateSavedProfile(id, updates);
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
    const shareId = saveSharedProfile(profile);
    const shareUrl = generateShareUrl(shareId);
    const qrCodeUrl = generateQRCodeUrl(shareUrl);
    setSharingProfile({ profile, shareUrl, qrCodeUrl });
    toast({ title: 'Link gerado!', description: 'Compartilhe seu perfil com outras pessoas.' });
  };

  const handleGenerateProfilePdf = async (profile: SavedProfile) => {
    setGeneratingPdfId(profile.id);
    try {
      const result = await generateProfilePDF(profile);
      updateSavedProfile(profile.id, {
        pdfStatus: 'PDF_GERADO',
        pdfDataUrl: result.dataUrl,
        pdfFileName: result.fileName,
        pdfGeneratedAt: new Date().toISOString(),
        pdfError: null,
      });
      toast({
        title: 'PDF gerado',
        description: `${result.fileName} ficou disponível para download.`,
      });
    } catch (error) {
      updateSavedProfile(profile.id, {
        pdfStatus: 'ERRO',
        pdfError: error instanceof Error ? error.message : 'Erro inesperado ao gerar PDF.',
      });
      toast({
        title: 'Não foi possível gerar o PDF',
        description: error instanceof Error ? error.message : 'Verifique os dados do perfil e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleDownloadProfilePdf = (profile: SavedProfile) => {
    if (!profile.pdfDataUrl || !profile.pdfFileName) {
      toast({
        title: 'PDF indisponível',
        description: 'Gere o PDF deste perfil antes de baixar.',
        variant: 'destructive',
      });
      return;
    }

    downloadProfilePDF(profile.pdfDataUrl, profile.pdfFileName);
  };

  const handleProfileStatusChange = async (profile: SavedProfile, status: ProfilePdfStatus) => {
    if (status === 'PDF_GERADO' && !profile.pdfDataUrl) {
      await handleGenerateProfilePdf(profile);
      return;
    }

    if (status === 'ENVIADO' && !profile.pdfDataUrl) {
      toast({
        title: 'PDF necessário',
        description: 'Gere o PDF antes de marcar como enviado.',
        variant: 'destructive',
      });
      return;
    }

    const statusUpdates: Partial<SavedProfile> = {
      pdfStatus: status,
      pdfError: status === 'ERRO' ? 'Status marcado manualmente como erro.' : null,
    };

    if (status === 'ENVIADO') {
      statusUpdates.pdfSentAt = new Date().toISOString();
    }

    if (status === 'PENDENTE' || status === 'EM_ANALISE' || status === 'PDF_GERADO') {
      statusUpdates.pdfSentAt = null;
    }

    const updatedProfile = updateSavedProfile(profile.id, {
      ...statusUpdates,
    });

    if (updatedProfile) {
      toast({
        title: 'Status atualizado',
        description: `${profile.profileName} agora está como ${status}.`,
      });
    }
  };

  const availableTags = getAvailableTags();

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };





  return (

    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Meus Perfis Salvos</h1>
        <p className="text-muted-foreground">Gerencie e acesse seus cálculos numerológicos salvos</p>
      </div>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="profiles">Perfis</TabsTrigger>
          <TabsTrigger value="backup">
            <Shield className="w-4 h-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar perfis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="numerology">Numerologia</SelectItem>
                <SelectItem value="compatibility">Compatibilidade</SelectItem>
                <SelectItem value="personalYear">Ano Pessoal</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className="w-4 h-4 mr-2" />
              Favoritos
            </Button>
          </div>

          {availableTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtrar por tags:</span>
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExportImport(true)}>
              <Download className="w-4 h-4 mr-2" />
              Exportar/Importar
            </Button>
            <Button variant="outline" onClick={() => setShowClearDialog(true)} disabled={profiles.length === 0}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos
            </Button>
          </div>

          {filteredProfiles.length === 0 ? (

            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Nenhum perfil encontrado</p>
              <p className="text-sm mt-2">Salve seus cálculos para acessá-los rapidamente depois</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onLoad={handleLoadProfile}
                  onDelete={handleDeleteProfile}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={handleEditProfile}
                  onShare={handleShareProfile}
                  onGeneratePdf={handleGenerateProfilePdf}
                  onDownloadPdf={handleDownloadProfilePdf}
                  onStatusChange={handleProfileStatusChange}
                  isGeneratingPdf={generatingPdfId === profile.id}
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
