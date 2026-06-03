import React, { useState } from 'react';
import { ProfileSelector } from './ProfileSelector';
import { SavedProfile } from '../utils/profileStorage';
import { formatBrazilianPhone, isValidBrazilianPhone } from '@/utils/phoneUtils';

interface NumerologyFormProps {
  onSubmit: (name: string, birthDate: string, phone: string, email?: string) => void;
}

export default function NumerologyForm({ onSubmit }: NumerologyFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; birthDate?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string; birthDate?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Nome completo é obrigatório';
    } else if (name.trim().split(' ').length < 2) {
      newErrors.name = 'Por favor, insira seu nome completo';
    }
    if (!birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Telefone/WhatsApp é obrigatório';
    } else if (!isValidBrazilianPhone(phone)) {
      newErrors.phone = 'Informe um telefone/WhatsApp válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(name, birthDate, phone, email);
    }
  };

  const handleProfileSelect = (profile: SavedProfile | null) => {
    if (profile) {
      setName(profile.name);
      setBirthDate(profile.birthDate);
      setPhone(formatBrazilianPhone((profile as any).phone || ''));
      setEmail((profile as any).email || '');
      setErrors({});
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setBirthDate('');
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileSelector onSelect={handleProfileSelect} filterType="numerology" tone="dark" />
      <div>
        <label className="block text-sm font-medium text-purple-100 mb-2">Nome Completo</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          placeholder="Digite seu nome completo" />
        {errors.name && <p className="mt-1 text-sm text-red-300">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-purple-100 mb-2">Telefone / WhatsApp</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatBrazilianPhone(e.target.value))}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          placeholder="(11) 99999-9999"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-300">{errors.phone}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-purple-100 mb-2">Email (opcional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          placeholder="cliente@email.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-purple-100 mb-2">Data de Nascimento</label>
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
        {errors.birthDate && <p className="mt-1 text-sm text-red-300">{errors.birthDate}</p>}
      </div>
      <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg">
        Calcular Mapa da Alma
      </button>
    </form>
  );
}
