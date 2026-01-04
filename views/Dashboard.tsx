import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ViewState, Appointment } from '../types';
import Header from '../components/Header';
import Layout from '../components/Layout';

interface DashboardProps {
  onViewChange: (view: ViewState) => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
  appointments: Appointment[];
}

const data = [
  { day: 'Seg', val: 40 },
  { day: 'Ter', val: 65 },
  { day: 'Qua', val: 35 },
  { day: 'Qui', val: 85 },
  { day: 'Sex', val: 55 },
  { day: 'Sáb', val: 95 },
  { day: 'Dom', val: 20 },
];

const Dashboard: React.FC<DashboardProps> = ({
  onViewChange,
  onNotificationsClick,
  onProfileClick,
  appointments
}) => {
  const todayISO = new Date().toLocaleDateString('en-CA');
  const todayAppointments = appointments.filter(app => app.dateStr === todayISO);
  const nextClient = todayAppointments[0]; // Simplification for demo

  const dailyRevenue = todayAppointments.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <Layout className="px-6 pt-2">
      <Header
        showNotifications
        onNotificationsClick={onNotificationsClick}
        showProfile
        onProfileClick={onProfileClick}
      />

      <div className="flex flex-col gap-6 mt-6 pb-24">
        {/* KPI Cards */}
        <section className="grid grid-cols-2 gap-4">
          <div
            onClick={() => onViewChange('schedule')}
            className="cursor-pointer flex flex-col gap-3 rounded-2xl bg-white dark:bg-card-dark p-5 shadow-card hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">
                calendar_today
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
                Hoje
              </p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-slate-900 dark:text-white text-3xl font-bold">
                  {todayAppointments.length}
                </h3>
                <span className="text-slate-400 text-xs">agendas</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => onViewChange('clients')}
            className="cursor-pointer flex flex-col gap-3 rounded-2xl bg-white dark:bg-card-dark p-5 shadow-card hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <span className="material-symbols-outlined text-[20px]">
                group_add
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">
                Novos
              </p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-slate-900 dark:text-white text-3xl font-bold">
                  3
                </h3>
                <span className="text-slate-400 text-xs">clientes</span>
              </div>
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-between rounded-2xl bg-white dark:bg-card-dark p-5 shadow-card hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col gap-1">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Faturamento do Dia
              </p>
              <h3 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                R$ {dailyRevenue},00
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <span className="material-symbols-outlined text-[24px]">
                attach_money
              </span>
            </div>
          </div>
        </section>

        {/* Chart */}
        <section className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-card-dark p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                Faturamento Semanal
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Últimos 7 dias
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <span className="material-symbols-outlined text-[14px]">
                trending_up
              </span>
              <span>+12%</span>
            </div>
          </div>

          <div className="mt-4 h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="val" radius={[4, 4, 4, 4]} barSize={24}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.day === 'Sáb' ? '#EC4899' : 'rgba(236, 72, 153, 0.2)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Next Client */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold">
              Próximo Cliente
            </h3>
            <button
              onClick={() => onViewChange('schedule')}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Ver todos
            </button>
          </div>
          {nextClient && (
            <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-card-dark p-4 shadow-card">
              <div className="flex flex-col items-center justify-center rounded-xl bg-primary/10 px-3 py-2 text-primary whitespace-nowrap">
                <span className="text-sm font-bold">{nextClient.time}</span>
                <span className="text-[10px] font-medium uppercase">Hoje</span>
              </div>
              <div className="flex flex-1 flex-col justify-center min-w-0">
                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {nextClient.clientName}
                </h4>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    spa
                  </span>
                  <span className="truncate">{nextClient.service}</span>
                </div>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-green-600 transition-colors">
                <span className="material-symbols-outlined filled text-[20px]">
                  check_circle
                </span>
              </button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;