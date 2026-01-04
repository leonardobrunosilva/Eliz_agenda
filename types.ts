export type ViewState = 'login' | 'dashboard' | 'clients' | 'financial' | 'schedule' | 'profile';

export interface Client {
  id?: string;
  name: string;
  phone: string;
  avatar: string; // URL
  vip?: boolean;
  initials?: string;
  visits?: number;
  lastVisit?: string;
  bg?: string; // Standard color class if no avatar
}

export interface Appointment {
  id?: string;
  time: string;
  clientName: string;
  service: string;
  price: number;
  dateStr: string; // "Hoje" or "Ontem"
  avatar?: string;
  initials?: string;
  status?: 'confirmed' | 'pending';
  paymentMethod?: 'Dinheiro' | 'PIX' | 'Mensal';
}

export interface DailyStat {
  day: string;
  value: number;
  fullDate: string;
}
