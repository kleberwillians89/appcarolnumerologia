import { NumerologyResult } from '../utils/numerologyCalculations';
import { CompatibilityResult } from '../utils/compatibilityCalculations';

export interface PersonFormData {
  name: string;
  day: string;
  month: string;
  year: string;
}

export const createHandlers = (
  setResults: (r: NumerologyResult | null) => void,
  setUserData: (d: any) => void,
  setCompatibilityResult: (r: CompatibilityResult | null) => void,
  calculateAllNumbers: any,
  calculateCompatibility: any,
  generatePDF: any,
  results: NumerologyResult | null,
  userData: any
) => {
  const handleSubmit = (name: string, birthDate: string) => {
    const calculatedResults = calculateAllNumbers(name, birthDate);
    setResults(calculatedResults);
    setUserData({ name, birthDate });
  };

  const handleCompatibilityCalculate = (person1: PersonFormData, person2: PersonFormData) => {
    const p1 = {
      name: person1.name,
      day: parseInt(person1.day),
      month: parseInt(person1.month),
      year: parseInt(person1.year)
    };
    const p2 = {
      name: person2.name,
      day: parseInt(person2.day),
      month: parseInt(person2.month),
      year: parseInt(person2.year)
    };
    const result = calculateCompatibility(p1, p2);
    setCompatibilityResult(result);
  };

  const handleDownloadPDF = () => {
    if (results && userData) {
      generatePDF(userData.name, userData.birthDate, results);
    }
  };

  const handleReset = () => {
    setResults(null);
    setUserData(null);
  };

  const handleCompatibilityReset = () => {
    setCompatibilityResult(null);
  };

  return { handleSubmit, handleCompatibilityCalculate, handleDownloadPDF, handleReset, handleCompatibilityReset };
};
