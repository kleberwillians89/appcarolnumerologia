import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Database, Download, Trash2, GitCompare } from 'lucide-react';
import { BackupHistoryEntry, formatFileSize } from '@/utils/historyStorage';

interface BackupHistoryModalProps {
  open: boolean;
  onClose: () => void;
  backups: BackupHistoryEntry[];
  onRestore: (backup: BackupHistoryEntry) => void;
  onDelete: (id: string) => void;
  onMerge: (backupIds: string[]) => void;
}

export const BackupHistoryModal = ({
  open,
  onClose,
  backups,
  onRestore,
  onDelete,
  onMerge,
}: BackupHistoryModalProps) => {
  const [selectedBackups, setSelectedBackups] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const toggleBackup = (id: string) => {
    setSelectedBackups(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleMerge = () => {
    if (selectedBackups.length >= 2) {
      onMerge(selectedBackups);
      setSelectedBackups([]);
      setCompareMode(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto border-yellow-500/25 bg-slate-950 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white">
            <span className="flex items-center gap-2">
              <Database className="w-5 h-5 text-yellow-400" />
              Histórico de Backups ({backups.length})
            </span>
            <Button
              variant={compareMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCompareMode(!compareMode)}
              className={compareMode ? 'bg-yellow-500 text-white hover:bg-yellow-400' : 'border-slate-500 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white'}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              {compareMode ? 'Cancelar' : 'Comparar'}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {compareMode && selectedBackups.length >= 2 && (
          <Button onClick={handleMerge} className="w-full bg-yellow-500 text-white hover:bg-yellow-400">
            Mesclar {selectedBackups.length} Backups Selecionados
          </Button>
        )}

        <div className="space-y-3">
          {backups.map((backup) => (
            <Card key={backup.id} className="border border-white/10 bg-slate-900/75 p-4 text-slate-100">
              <div className="flex items-start gap-3">
                {compareMode && (
                  <Checkbox
                    checked={selectedBackups.includes(backup.id)}
                    onCheckedChange={() => toggleBackup(backup.id)}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-100">
                        {new Date(backup.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-yellow-500/15 text-white border-yellow-500/30">{backup.profileCount} perfis</Badge>
                      <Badge variant="outline" className="border-slate-400 text-slate-300">{formatFileSize(backup.fileSize)}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => onRestore(backup)} className="bg-yellow-500 text-white hover:bg-yellow-400">
                      <Download className="w-3 h-3 mr-1" />
                      Restaurar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(backup.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
