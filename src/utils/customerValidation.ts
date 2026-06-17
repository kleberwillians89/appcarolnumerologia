import { isValidBrazilianPhone } from '@/utils/phoneUtils';

export interface CustomerFormValues {
  nome: string;
  telefone: string;
  email?: string;
  dataNascimento: string;
}

export interface CustomerFormErrors {
  nome?: string;
  telefone?: string;
  email?: string;
  dataNascimento?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isRealDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const validateCustomerForm = (values: CustomerFormValues): CustomerFormErrors => {
  const errors: CustomerFormErrors = {};
  const nome = values.nome.trim();
  const email = values.email?.trim() || '';

  if (!nome) {
    errors.nome = 'Informe seu nome completo.';
  } else if (nome.split(/\s+/).length < 2) {
    errors.nome = 'Digite nome e sobrenome para personalizar a leitura.';
  }

  if (!values.telefone.trim()) {
    errors.telefone = 'Informe um WhatsApp com DDD.';
  } else if (!isValidBrazilianPhone(values.telefone)) {
    errors.telefone = 'Use um WhatsApp brasileiro válido, com DDD.';
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errors.email = 'Informe um e-mail válido ou deixe em branco.';
  }

  if (!values.dataNascimento) {
    errors.dataNascimento = 'Informe sua data de nascimento.';
  } else if (!isRealDate(values.dataNascimento)) {
    errors.dataNascimento = 'Informe uma data real.';
  } else {
    const birthDate = new Date(`${values.dataNascimento}T00:00:00`);
    const today = new Date();
    const minDate = new Date('1900-01-01T00:00:00');

    if (birthDate > today) {
      errors.dataNascimento = 'A data de nascimento não pode ser futura.';
    } else if (birthDate < minDate) {
      errors.dataNascimento = 'Use uma data a partir de 1900.';
    }
  }

  return errors;
};

export const hasCustomerFormErrors = (errors: CustomerFormErrors) => Object.keys(errors).length > 0;
