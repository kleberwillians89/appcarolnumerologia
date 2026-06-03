export const formatDateBR = (dateString?: string | null) => {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;

  return `${day}/${month}/${year}`;
};

export const parseLocalDateParts = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return { year, month, day };
};
