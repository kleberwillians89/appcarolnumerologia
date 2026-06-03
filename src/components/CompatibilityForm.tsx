import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ProfileSelector } from './ProfileSelector';
import { SavedProfile } from '../utils/profileStorage';
import { CreateProfileModal } from './CreateProfileModal';
import { UserPlus } from 'lucide-react';
interface PersonFormData {
  name: string;
  day: string;
  month: string;
  year: string;
}

interface CompatibilityFormProps {
  onCalculate: (person1: PersonFormData, person2: PersonFormData) => void;
}

export const CompatibilityForm = ({ onCalculate }: CompatibilityFormProps) => {
  const [person1, setPerson1] = useState<PersonFormData>({ name: '', day: '', month: '', year: '' });
  const [person2, setPerson2] = useState<PersonFormData>({ name: '', day: '', month: '', year: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingForPerson, setCreatingForPerson] = useState<1 | 2>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (person1.name && person1.day && person1.month && person1.year &&
        person2.name && person2.day && person2.month && person2.year) {
      console.log('✅ [CompatibilityForm] Calculando compatibilidade:', {
        person1: person1.name,
        person2: person2.name
      });
      onCalculate(person1, person2);
    }
  };

  const handleProfile1Select = (profile: SavedProfile | null) => {
    if (profile) {
      console.log('✅ [CompatibilityForm] Perfil 1 selecionado:', profile.profileName);
      const [year, month, day] = profile.birthDate.split('-');
      setPerson1({ name: profile.name, day, month, year });
    } else {
      console.log('🔄 [CompatibilityForm] Perfil 1 limpo');
      setPerson1({ name: '', day: '', month: '', year: '' });
    }
  };

  const handleProfile2Select = (profile: SavedProfile | null) => {
    if (profile) {
      console.log('✅ [CompatibilityForm] Perfil 2 selecionado:', profile.profileName);
      const [year, month, day] = profile.birthDate.split('-');
      setPerson2({ name: profile.name, day, month, year });
    } else {
      console.log('🔄 [CompatibilityForm] Perfil 2 limpo');
      setPerson2({ name: '', day: '', month: '', year: '' });
    }
  };

  const handleCreateProfile = (person: number) => {
    console.log(`🔵 [CompatibilityForm] Abrindo modal para criar perfil ${person}`);
    setCreatingForPerson(person as 1 | 2);
    setShowCreateModal(true);
  };

  const handleProfileCreated = (profile: any) => {
    console.log('✅ [CompatibilityForm] Perfil criado:', profile.name);
    const formData = {
      name: profile.name,
      day: profile.data.day.toString(),
      month: profile.data.month.toString(),
      year: profile.data.year.toString()
    };

    if (creatingForPerson === 1) {
      console.log('✅ [CompatibilityForm] Preenchendo dados da Pessoa 1');
      setPerson1(formData);
    } else {
      console.log('✅ [CompatibilityForm] Preenchendo dados da Pessoa 2');
      setPerson2(formData);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700 text-base sm:text-lg">Pessoa 1</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <ProfileSelector onSelect={handleProfile1Select} label="Carregar Perfil" />
                </div>
                <Button
                  type="button"
                  onClick={() => handleCreateProfile(1)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 sm:mt-8 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Criar
                </Button>
              </div>
              <div>
                <Label htmlFor="name1" className="text-sm">Nome Completo</Label>
                <Input id="name1" value={person1.name} onChange={(e) => setPerson1({...person1, name: e.target.value})} placeholder="João Silva" className="text-sm" required />
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <div><Label htmlFor="day1" className="text-xs sm:text-sm">Dia</Label><Input id="day1" type="number" min="1" max="31" value={person1.day} onChange={(e) => setPerson1({...person1, day: e.target.value})} className="text-sm" required /></div>
                <div><Label htmlFor="month1" className="text-xs sm:text-sm">Mês</Label><Input id="month1" type="number" min="1" max="12" value={person1.month} onChange={(e) => setPerson1({...person1, month: e.target.value})} className="text-sm" required /></div>
                <div><Label htmlFor="year1" className="text-xs sm:text-sm">Ano</Label><Input id="year1" type="number" min="1900" max="2100" value={person1.year} onChange={(e) => setPerson1({...person1, year: e.target.value})} className="text-sm" required /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-pink-200">
            <CardHeader>
              <CardTitle className="text-pink-700 text-base sm:text-lg">Pessoa 2</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <ProfileSelector onSelect={handleProfile2Select} label="Carregar Perfil" />
                </div>
                <Button
                  type="button"
                  onClick={() => handleCreateProfile(2)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 sm:mt-8 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Criar
                </Button>
              </div>
              <div>
                <Label htmlFor="name2" className="text-sm">Nome Completo</Label>
                <Input id="name2" value={person2.name} onChange={(e) => setPerson2({...person2, name: e.target.value})} placeholder="Maria Santos" className="text-sm" required />
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <div><Label htmlFor="day2" className="text-xs sm:text-sm">Dia</Label><Input id="day2" type="number" min="1" max="31" value={person2.day} onChange={(e) => setPerson2({...person2, day: e.target.value})} className="text-sm" required /></div>
                <div><Label htmlFor="month2" className="text-xs sm:text-sm">Mês</Label><Input id="month2" type="number" min="1" max="12" value={person2.month} onChange={(e) => setPerson2({...person2, month: e.target.value})} className="text-sm" required /></div>
                <div><Label htmlFor="year2" className="text-xs sm:text-sm">Ano</Label><Input id="year2" type="number" min="1900" max="2100" value={person2.year} onChange={(e) => setPerson2({...person2, year: e.target.value})} className="text-sm" required /></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base sm:text-lg py-4 sm:py-6">
          Calcular Compatibilidade
        </Button>
      </form>


      <CreateProfileModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProfileCreated={handleProfileCreated}
        title={`Criar Perfil para Pessoa ${creatingForPerson}`}
      />
    </>
  );
};
