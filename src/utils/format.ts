export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

export const formatTime = (time: string): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(`2000-01-01T${time}`));
};
