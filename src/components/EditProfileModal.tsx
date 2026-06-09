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
import { formatBrazilianPhone, isValidBrazilianPhone } from '@/utils/phoneUtils';

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
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileName(profile.profileName);
      setName(profile.name);
      setBirthDate(profile.birthDate);
      setPhone(formatBrazilianPhone(profile.phone || ''));
      setEmail(profile.email || '');
      setNotes(profile.notes || '');
      setSelectedTags(profile.tags || []);
      setErrors({});
      setShowConfirm(false);
    }
  }, [profile]);


  const validateDate = (date: string): boolean => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!match) return false;
    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
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
      newErrors.birthDate = 'Data inválida';
    }

    if (phone.trim() && !isValidBrazilianPhone(phone)) {
      newErrors.phone = 'Telefone/WhatsApp inválido';
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
        phone: phone.trim(),
        email: email.trim(),
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
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              {errors.birthDate && (
                <p className="text-sm text-red-500">{errors.birthDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatBrazilianPhone(e.target.value))}
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
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
