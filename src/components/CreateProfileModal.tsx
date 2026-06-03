import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, User, Calendar, Hash } from 'lucide-react';
import { calculateAllNumbers } from '../utils/numerologyCalculations';
import { calculatePersonalYear } from '../utils/numerologyCalculations2';
import { saveProfile } from '../utils/profileStorage';
import { useToast } from '@/hooks/use-toast';

interface CreateProfileModalProps {
  open: boolean;
  onClose: () => void;
  onProfileCreated: (profile: any) => void;
  title?: string;
}

export const CreateProfileModal = ({ 
  open, 
  onClose, 
  onProfileCreated,
  title = "Criar Novo Perfil"
}: CreateProfileModalProps) => {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    day: '',
    month: '',
    year: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.day || !formData.month || !formData.year) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Calcula todos os números numerológicos
      const birthDateString = `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`;
      const numerologyData = calculateAllNumbers(formData.name, birthDateString);

      // Calcula o ano pessoal
      const currentYear = new Date().getFullYear();
      const personalYear = calculatePersonalYear(
        parseInt(formData.day),
        parseInt(formData.month),
        currentYear
      );

      // Formata a data de nascimento
      const birthDate = `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`;

      // Cria o perfil completo
      const newProfile = {
        profileName: `${formData.name} - Perfil Completo`,
        name: formData.name,
        birthDate,
        type: 'numerology' as const,

        data: {
          numerology: numerologyData,
          personalYear: {
            year: currentYear,
            personalYear: personalYear.personalYear,
            ...personalYear
          },
          day: parseInt(formData.day),
          month: parseInt(formData.month),
          year: parseInt(formData.year)
        },
        results: {
          ...numerologyData,
          personalYear: personalYear.personalYear,
          day: parseInt(formData.day),
          month: parseInt(formData.month),
          year: parseInt(formData.year)
        },
        notes: `Perfil criado automaticamente para ${title}`
      };

      // Salva o perfil e captura o perfil retornado com ID
      const savedProfile = saveProfile(newProfile);

      toast({
        title: "Perfil Criado!",
        description: `Perfil de ${formData.name} foi criado e salvo com sucesso.`,
      });

      // Retorna o perfil salvo (com ID gerado)
      onProfileCreated(savedProfile);


      // Limpa o formulário
      setFormData({ name: '', day: '', month: '', year: '' });
      
      // Fecha o modal
      onClose();
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', day: '', month: '', year: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="profile-name" className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Nome Completo
            </Label>
            <Input
              id="profile-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Ana Maria Silva"
              required
              disabled={isCalculating}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Data de Nascimento
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  placeholder="Dia"
                  required
                  disabled={isCalculating}
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  placeholder="Mês"
                  required
                  disabled={isCalculating}
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="Ano"
                  required
                  disabled={isCalculating}
                />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-700 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Este perfil calculará automaticamente:
            </p>
            <ul className="text-xs text-purple-600 mt-2 ml-6 space-y-1">
              <li>• Números Essenciais (Alma, Destino, Talento, etc.)</li>
              <li>• Jornada da Vida (Ciclos e Desafios)</li>
              <li>• Ano Pessoal e Previsões</li>
            </ul>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCalculating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCalculating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                'Criar Perfil'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};