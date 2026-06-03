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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Histórico de Backups ({backups.length})
            </span>
            <Button
              variant={compareMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCompareMode(!compareMode)}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              {compareMode ? 'Cancelar' : 'Comparar'}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {compareMode && selectedBackups.length >= 2 && (
          <Button onClick={handleMerge} className="w-full">
            Mesclar {selectedBackups.length} Backups Selecionados
          </Button>
        )}

        <div className="space-y-3">
          {backups.map((backup) => (
            <Card key={backup.id} className="p-4">
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
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">
                        {new Date(backup.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{backup.profileCount} perfis</Badge>
                      <Badge variant="outline">{formatFileSize(backup.fileSize)}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => onRestore(backup)}>
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
