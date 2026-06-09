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
    <div className="space-y-6 text-slate-100">
      <Card className="border border-yellow-500/20 bg-slate-900/75 text-slate-100 shadow-lg shadow-black/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5 text-yellow-400" />
            Configurações de Backup Automático
          </CardTitle>
          <CardDescription className="text-slate-300">Configure quando os backups automáticos devem ocorrer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled" className="text-slate-200">Backup Automático</Label>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intervalDays" className="text-slate-300">Intervalo (dias)</Label>
            <Input
              id="intervalDays"
              type="number"
              min="1"
              value={config.intervalDays}
              onChange={(e) => handleConfigChange('intervalDays', parseInt(e.target.value))}
              className="bg-white text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxProfiles" className="text-slate-300">Máximo de perfis antes do backup</Label>
            <Input
              id="maxProfiles"
              type="number"
              min="1"
              value={config.maxProfilesBeforeBackup}
              onChange={(e) => handleConfigChange('maxProfilesBeforeBackup', parseInt(e.target.value))}
              className="bg-white text-slate-900"
            />
          </div>

          <Alert className="border-yellow-500/25 bg-white/[0.04] text-slate-200">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <AlertDescription className="text-slate-200">
              Último backup: {lastBackupDate} ({config.lastBackupProfileCount} perfis)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="border border-yellow-500/20 bg-slate-900/75 text-slate-100 shadow-lg shadow-black/10">
        <CardHeader>
          <CardTitle className="text-white">Ações de Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleManualBackup} className="w-full bg-yellow-500 text-white hover:bg-yellow-400">
            <Download className="w-4 h-4 mr-2" />
            Fazer Backup Manual ({profiles.length} perfis)
          </Button>

          <Button onClick={() => setShowHistory(true)} variant="outline" className="w-full border-slate-500 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white">
            <History className="w-4 h-4 mr-2" />
            Ver Histórico de Backups ({backupHistory.length})
          </Button>

          <div>
            <Label htmlFor="restore" className="cursor-pointer text-slate-300">
              <Button asChild className="w-full bg-yellow-500 text-white hover:bg-yellow-400">
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
        <Card className="border-blue-400/40 bg-slate-900/75 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-yellow-400" />
              Visualização do Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-200">Data do Backup:</p>
                <p className="text-slate-300">{new Date(previewData.timestamp).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200">Total de Perfis:</p>
                <p className="text-slate-300">{previewData.profileCount}</p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {previewData.profiles.map((profile, idx) => (
                <div key={idx} className="p-2 bg-white/[0.04] rounded text-sm">
                  <p className="font-semibold text-slate-100">{profile.profileName}</p>
                  <p className="text-slate-300">{profile.fullName} - {profile.birthDate}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRestore} className="flex-1 bg-yellow-500 text-white hover:bg-yellow-400">
                Confirmar Restauração
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1 border-slate-500 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
