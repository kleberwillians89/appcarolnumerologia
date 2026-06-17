import React, { useState } from 'react';
import { ProfileSelector } from './ProfileSelector';
import { SavedProfile } from '../utils/profileStorage';
import { formatBrazilianPhone } from '@/utils/phoneUtils';
import { CustomerFormErrors, hasCustomerFormErrors, validateCustomerForm } from '@/utils/customerValidation';

interface NumerologyFormProps {
  onSubmit: (name: string, birthDate: string, phone: string, email?: string) => void;
}

export default function NumerologyForm({ onSubmit }: NumerologyFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [errors, setErrors] = useState<CustomerFormErrors>({});

  const validateForm = () => {
    const newErrors = validateCustomerForm({
      nome: name,
      telefone: phone,
      email,
      dataNascimento: birthDate,
    });
    setErrors(newErrors);
    return !hasCustomerFormErrors(newErrors);
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
      setPhone(formatBrazilianPhone(profile.phone || ''));
      setEmail(profile.email || '');
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
        {errors.nome && <p className="mt-1 text-sm text-red-300">{errors.nome}</p>}
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
        {errors.telefone && <p className="mt-1 text-sm text-red-300">{errors.telefone}</p>}
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
        {errors.email && <p className="mt-1 text-sm text-red-300">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-purple-100 mb-2">Data de Nascimento</label>
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
        {errors.dataNascimento && <p className="mt-1 text-sm text-red-300">{errors.dataNascimento}</p>}
      </div>
      <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg">
        Calcular Mapa da Alma
      </button>
    </form>
  );
}
