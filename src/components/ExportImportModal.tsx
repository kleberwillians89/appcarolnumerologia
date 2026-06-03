import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { exportProfiles, importProfiles } from '@/utils/profileStorage';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExportImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  open,
  onClose,
  onImportSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = () => {
    const data = exportProfiles();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `numerologia-perfis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Perfis exportados com sucesso!' });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importProfiles(content);
      if (result.success) {
        setMessage({ type: 'success', text: `${result.count} perfis importados!` });
        onImportSuccess();
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao importar' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar / Importar Perfis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleExport} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Todos os Perfis
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar Perfis
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
