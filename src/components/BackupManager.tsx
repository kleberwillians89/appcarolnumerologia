import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, Settings, Calendar, Users, History } from 'lucide-react';
import { getBackupConfig, saveBackupConfig, downloadBackup, parseBackupFile, BackupData } from '@/utils/autoBackupService';
import { SavedProfile } from '@/utils/profileStorage';
import { BackupHistoryModal } from './BackupHistoryModal';
import { getBackupHistory, deleteBackupFromHistory, BackupHistoryEntry } from '@/utils/historyStorage';
import { useToast } from '@/hooks/use-toast';


interface BackupManagerProps {
  profiles: SavedProfile[];
  onRestore: (profiles: SavedProfile[]) => void;
}

export const BackupManager = ({ profiles, onRestore }: BackupManagerProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState(getBackupConfig());
  const [previewData, setPreviewData] = useState<BackupData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupHistoryEntry[]>(getBackupHistory());


  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    saveBackupConfig(newConfig);
  };

  const handleManualBackup = () => {
    downloadBackup(profiles);
    setBackupHistory(getBackupHistory());
    toast({
      title: 'Backup criado',
      description: 'Backup salvo com sucesso no histórico',
    });
  };

  const handleRestoreFromHistory = (backup: BackupHistoryEntry) => {
    if (window.confirm(`Restaurar ${backup.profileCount} perfis deste backup?`)) {
      onRestore(backup.profiles);
      toast({
        title: 'Backup restaurado',
        description: `${backup.profileCount} perfis foram restaurados`,
      });
      setShowHistory(false);
    }
  };

  const handleDeleteBackup = (id: string) => {
    if (window.confirm('Deseja excluir este backup do histórico?')) {
      deleteBackupFromHistory(id);
      setBackupHistory(getBackupHistory());
      toast({
        title: 'Backup excluído',
        description: 'Backup removido do histórico',
      });
    }
  };

  const handleMergeBackups = (backupIds: string[]) => {
    const backupsToMerge = backupHistory.filter(b => backupIds.includes(b.id));
    const allProfiles = backupsToMerge.flatMap(b => b.profiles);
    
    // Remove duplicates by profileName
    const uniqueProfiles = allProfiles.filter((profile, index, self) =>
      index === self.findIndex(p => p.profileName === profile.profileName)
    );

    if (window.confirm(`Mesclar ${backupsToMerge.length} backups? Total: ${uniqueProfiles.length} perfis únicos`)) {
      onRestore(uniqueProfiles);
      toast({
        title: 'Backups mesclados',
        description: `${uniqueProfiles.length} perfis únicos foram restaurados`,
      });
      setShowHistory(false);
    }
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const backup = parseBackupFile(content);
      if (backup) {
        setPreviewData(backup);
        setShowPreview(true);
      } else {
        alert('Arquivo de backup inválido');
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (previewData && window.confirm(`Deseja restaurar ${previewData.profileCount} perfis? Isso substituirá os perfis atuais.`)) {
      onRestore(previewData.profiles);
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  const lastBackupDate = config.lastBackupDate 
    ? new Date(config.lastBackupDate).toLocaleDateString('pt-BR')
    : 'Nunca';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Backup Automático
          </CardTitle>
          <CardDescription>Configure quando os backups automáticos devem ocorrer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Backup Automático</Label>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intervalDays">Intervalo (dias)</Label>
            <Input
              id="intervalDays"
              type="number"
              min="1"
              value={config.intervalDays}
              onChange={(e) => handleConfigChange('intervalDays', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxProfiles">Máximo de perfis antes do backup</Label>
            <Input
              id="maxProfiles"
              type="number"
              min="1"
              value={config.maxProfilesBeforeBackup}
              onChange={(e) => handleConfigChange('maxProfilesBeforeBackup', parseInt(e.target.value))}
            />
          </div>

          <Alert>
            <Calendar className="w-4 h-4" />
            <AlertDescription>
              Último backup: {lastBackupDate} ({config.lastBackupProfileCount} perfis)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações de Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleManualBackup} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Fazer Backup Manual ({profiles.length} perfis)
          </Button>

          <Button onClick={() => setShowHistory(true)} variant="outline" className="w-full">
            <History className="w-4 h-4 mr-2" />
            Ver Histórico de Backups ({backupHistory.length})
          </Button>

          <div>
            <Label htmlFor="restore" className="cursor-pointer">
              <Button asChild className="w-full">
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Restaurar de Backup
                </span>
              </Button>
            </Label>
            <Input
              id="restore"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      <BackupHistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        backups={backupHistory}
        onRestore={handleRestoreFromHistory}
        onDelete={handleDeleteBackup}
        onMerge={handleMergeBackups}
      />


      {showPreview && previewData && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Visualização do Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Data do Backup:</p>
                <p>{new Date(previewData.timestamp).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="font-semibold">Total de Perfis:</p>
                <p>{previewData.profileCount}</p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {previewData.profiles.map((profile, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                  <p className="font-semibold">{profile.profileName}</p>
                  <p className="text-gray-600">{profile.fullName} - {profile.birthDate}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRestore} className="flex-1">
                Confirmar Restauração
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
