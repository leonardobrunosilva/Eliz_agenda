import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import Header from '../components/Header';
import Layout from '../components/Layout';
import { Appointment } from '../types';

interface FinancialProps {
  onBack: () => void;
  appointments: Appointment[];
}

const Financial: React.FC<FinancialProps> = ({ onBack, appointments }) => {
  const [filter, setFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));

  const now = new Date(selectedDate + 'T12:00:00');
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });
  const yearName = now.getFullYear();

  // Dynamic calculations
  const dailyTotal = appointments
    .filter(app => app.dateStr === selectedDate)
    .reduce((acc, curr) => acc + curr.price, 0);

  const monthlyTotal = appointments
    .filter(app => {
      const d = new Date(app.dateStr + 'T12:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, curr) => acc + curr.price, 0);

  const yearlyTotal = appointments
    .filter(app => {
      const d = new Date(app.dateStr + 'T12:00:00');
      return d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, curr) => acc + curr.price, 0);

  // Labels and Values
  const total = filter === 'daily'
    ? `R$ ${dailyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : filter === 'monthly'
      ? `R$ ${monthlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : `R$ ${yearlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const label = filter === 'daily'
    ? `Resumo de ${now.toLocaleDateString('pt-BR')}`
    : filter === 'monthly'
      ? `Resumo de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`
      : `Resumo de ${yearName}`;

  // Calculate chart data dynamically
  const getChartData = () => {
    if (filter === 'daily') {
      // Return points for different parts of the day or just the hours with appointments
      const dayApps = appointments.filter(app => app.dateStr === selectedDate);
      const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
      return hours.map(h => {
        const total = dayApps
          .filter(app => app.time.split(':')[0] === h.split(':')[0])
          .reduce((acc, curr) => acc + curr.price, 0);
        return { name: h, val: total };
      });
    } else if (filter === 'monthly') {
      // Return points for each day of the month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const data = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const total = appointments
          .filter(app => app.dateStr === dateStr)
          .reduce((acc, curr) => acc + curr.price, 0);
        data.push({ name: `${i}`, val: total });
      }
      return data;
    } else {
      // yearly: Return points for each month
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return months.map((m, i) => {
        const total = appointments
          .filter(app => {
            const d = new Date(app.dateStr + 'T12:00:00');
            return d.getMonth() === i && d.getFullYear() === now.getFullYear();
          })
          .reduce((acc, curr) => acc + curr.price, 0);
        return { name: m, val: total };
      });
    }
  };

  const currentData = getChartData();

  return (
    <Layout className="px-4">
      <Header title="Finanças" showBack onBack={onBack} />

      {/* Date Selector */}
      <div className="mt-4 flex items-center gap-3 bg-white dark:bg-card-dark p-3 rounded-xl border border-primary/10 shadow-sm">
        <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">Selecione uma data</p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-transparent border-0 p-0 text-sm font-bold text-text-main dark:text-white focus:ring-0"
          />
        </div>
      </div>

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
            <span className="material-symbols-outlined text-sm font-bold">analytics</span>
            <p className="text-xs font-bold">Relatório em tempo real</p>
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
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#334155' }}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke="#EC4899"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVal)"
                animationDuration={1000}
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