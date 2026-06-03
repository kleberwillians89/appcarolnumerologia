import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { TagInput } from './TagInput';

interface SaveProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (profileName: string, notes: string, tags: string[]) => void;
  defaultName?: string;
}

export const SaveProfileModal: React.FC<SaveProfileModalProps> = ({
  open,
  onClose,
  onSave,
  defaultName = '',
}) => {
  const [profileName, setProfileName] = useState(defaultName);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSave = () => {
    if (profileName.trim()) {
      onSave(profileName.trim(), notes.trim(), selectedTags);
      setProfileName('');
      setNotes('');
      setSelectedTags([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Salvar Perfil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="profileName">Nome do Perfil *</Label>
            <Input
              id="profileName"
              placeholder="Ex: Meu Mapa Principal"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          
          <TagInput selectedTags={selectedTags} onChange={setSelectedTags} />
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre este perfil..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!profileName.trim()}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
