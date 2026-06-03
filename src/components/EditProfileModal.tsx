import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SavedProfile } from '@/utils/profileStorage';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TagInput } from './TagInput';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: SavedProfile | null;
  onSave: (id: string, updates: Partial<SavedProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  profile,
  onSave,
}) => {
  const [profileName, setProfileName] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileName(profile.profileName);
      setName(profile.name);
      setBirthDate(profile.birthDate);
      setNotes(profile.notes || '');
      setSelectedTags(profile.tags || []);
      setErrors({});
      setShowConfirm(false);
    }
  }, [profile]);


  const validateDate = (date: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) return false;
    const [day, month, year] = date.split('/').map(Number);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    return true;
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!profileName.trim()) {
      newErrors.profileName = 'Nome do perfil é obrigatório';
    }
    
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!birthDate.trim()) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else if (!validateDate(birthDate)) {
      newErrors.birthDate = 'Data inválida (use DD/MM/AAAA)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const confirmSave = () => {
    if (profile) {
      onSave(profile.id, {
        profileName: profileName.trim(),
        name: name.trim(),
        birthDate: birthDate.trim(),
        notes: notes.trim(),
        tags: selectedTags,
      });
      onClose();
    }
  };

  const handleClose = () => {
    setShowConfirm(false);
    onClose();
  };


  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        {!showConfirm ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Nome do Perfil *</Label>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Ex: Meu Mapa Completo"
              />
              {errors.profileName && (
                <p className="text-sm text-red-500">{errors.profileName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="DD/MM/AAAA"
              />
              {errors.birthDate && (
                <p className="text-sm text-red-500">{errors.birthDate}</p>
              )}
            </div>


            <TagInput selectedTags={selectedTags} onChange={setSelectedTags} />

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre este perfil..."
                rows={3}
              />
            </div>

          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tem certeza que deseja salvar as alterações neste perfil?
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          {!showConfirm ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Voltar
              </Button>
              <Button onClick={confirmSave}>
                Confirmar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
