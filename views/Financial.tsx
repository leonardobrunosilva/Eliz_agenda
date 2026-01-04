import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import Header from '../components/Header';
import Layout from '../components/Layout';
import { Appointment } from '../types';

const chartData = {
  daily: [
    { name: '08:00', val: 50 }, { name: '10:00', val: 120 }, { name: '12:00', val: 80 },
    { name: '14:00', val: 250 }, { name: '16:00', val: 180 }, { name: '18:00', val: 300 }
  ],
  monthly: [
    { name: 'Sem 1', val: 850 }, { name: 'Sem 2', val: 1100 }, { name: 'Sem 3', val: 950 }, { name: 'Sem 4', val: 1350 }
  ],
  yearly: [
    { name: 'Jan', val: 3200 }, { name: 'Fev', val: 4100 }, { name: 'Mar', val: 3800 }, { name: 'Abr', val: 4500 }
  ]
};

interface FinancialProps {
  onBack: () => void;
  appointments: Appointment[];
}

const Financial: React.FC<FinancialProps> = ({ onBack, appointments }) => {
  const [filter, setFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const todayISO = new Date().toLocaleDateString('en-CA');
  const todayAppointments = appointments.filter(app => app.dateStr === todayISO);
  const dailyTotal = todayAppointments.reduce((acc, curr) => acc + curr.price, 0);

  const currentData = chartData[filter];
  const total = filter === 'daily' ? `R$ ${dailyTotal},00` : filter === 'monthly' ? 'R$ 4.250,00' : 'R$ 15.600,00';
  const label = filter === 'daily' ? 'Resumo de Hoje' : filter === 'monthly' ? 'Resumo de Outubro' : 'Resumo de 2023';

  return (
    <Layout className="px-4">
      <Header title="Finanças" showBack onBack={onBack} />

      {/* Time Filter */}
      <div className="bg-primary/10 p-1 rounded-xl flex items-center justify-between mt-4">
        <button
          onClick={() => setFilter('daily')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${filter === 'daily' ? 'bg-card-light dark:bg-card-dark text-primary font-bold shadow-sm' : 'font-medium text-slate-600 dark:text-slate-300 hover:text-primary'}`}
        >
          Diário
        </button>
        <button
          onClick={() => setFilter('monthly')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${filter === 'monthly' ? 'bg-card-light dark:bg-card-dark text-primary font-bold shadow-sm' : 'font-medium text-slate-600 dark:text-slate-300 hover:text-primary'}`}
        >
          Mensal
        </button>
        <button
          onClick={() => setFilter('yearly')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${filter === 'yearly' ? 'bg-card-light dark:bg-card-dark text-primary font-bold shadow-sm' : 'font-medium text-slate-600 dark:text-slate-300 hover:text-primary'}`}
        >
          Anual
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{label}</h2>
      </div>

      {/* Main Card */}
      <div className="bg-primary text-white p-6 rounded-2xl shadow-soft relative overflow-hidden group mt-4">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white/90">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <p className="text-sm font-medium">Total Faturado</p>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-4xl font-bold tracking-tight">{total}</h3>
          </div>
          <div className="flex items-center gap-1 mt-2 bg-white/20 w-fit px-2 py-1 rounded-md">
            <span className="material-symbols-outlined text-sm font-bold">trending_up</span>
            <p className="text-xs font-bold">+12% vs período anterior</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-primary/10 shadow-card mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Evolução do Faturamento</h3>
        </div>
        <div className="relative w-full h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip />
              <Area
                type="monotone"
                dataKey="val"
                stroke="#EC4899"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Appointments List */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Últimos Agendamentos</h3>
          <button
            onClick={onBack}
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Ver todos
          </button>
        </div>
        <div className="flex flex-col gap-3 pb-8">
          {appointments.slice(0, 3).map((item, i) => (
            <div key={item.id || `fin-${i}`} className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-primary/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-primary/10 text-primary`}>
                  {item.initials}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.clientName}</p>
                  <p className="text-xs text-slate-500">{item.service}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">R$ {item.price}</p>
                <p className="text-xs text-slate-400">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Financial;