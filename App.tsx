import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Clients from './views/Clients';
import Financial from './views/Financial';
import Schedule from './views/Schedule';
import BottomNav from './components/BottomNav';
import { ViewState, Client, Appointment } from './types';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

import Profile from './views/Profile';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const savedView = localStorage.getItem('currentView');
    return (savedView as ViewState) || 'login';
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Persist view state
  useEffect(() => {
    if (currentView !== 'login') {
      localStorage.setItem('currentView', currentView);
    }
  }, [currentView]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // If we are on login view but have a session, move to dashboard
        // otherwise stay on the persisted view
        if (currentView === 'login') {
          setCurrentView('dashboard');
        }
        fetchData();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        if (currentView === 'login') {
          setCurrentView('dashboard');
        }
        fetchData();
      } else {
        setCurrentView('login');
        localStorage.removeItem('currentView');
        setClients([]);
        setAppointments([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, appointmentsRes] = await Promise.all([
        supabase.from('clients').select('*').order('name'),
        supabase.from('appointments').select('*').order('time')
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (appointmentsRes.error) throw appointmentsRes.error;

      setClients(clientsRes.data as Client[]);
      setAppointments(appointmentsRes.data as Appointment[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsClick = () => {
    alert('Notificações: Você tem 3 novos agendamentos para hoje!');
  };

  const handleAddClient = async (client: Client) => {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();

    if (error) {
      alert('Erro ao salvar cliente: ' + error.message);
      return;
    }
    setClients(prev => [...prev, data as Client]);
  };

  const handleUpdateClient = async (client: Client) => {
    const { error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', client.id);

    if (error) {
      alert('Erro ao atualizar cliente: ' + error.message);
      return;
    }
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
  };

  const handleAddAppointment = async (app: Appointment) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert([app])
      .select()
      .single();

    if (error) {
      alert('Erro ao salvar agendamento: ' + error.message);
      return;
    }
    setAppointments(prev => [...prev, data as Appointment]);
  };

  const handleUpdateAppointment = async (app: Appointment) => {
    const { error } = await supabase
      .from('appointments')
      .update(app)
      .eq('id', app.id);

    if (error) {
      alert('Erro ao atualizar agendamento: ' + error.message);
      return;
    }
    setAppointments(prev => prev.map(a => a.id === app.id ? app : a));
  };

  const handleDeleteAppointment = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir agendamento: ' + error.message);
      return;
    }
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const renderView = () => {
    if (loading && session) {
      return (
        <div className="flex h-full items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
        </div>
      );
    }

    if (!session) return <Login onLogin={() => setCurrentView('dashboard')} />;

    switch (currentView) {
      case 'login':
        return <Login onLogin={() => setCurrentView('dashboard')} />;
      case 'dashboard':
        return (
          <Dashboard
            onViewChange={setCurrentView}
            onNotificationsClick={handleNotificationsClick}
            onProfileClick={() => setCurrentView('profile')}
            appointments={appointments}
          />
        );
      case 'clients':
        return (
          <Clients
            onBack={() => setCurrentView('dashboard')}
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
          />
        );
      case 'financial':
        return (
          <Financial
            onBack={() => setCurrentView('dashboard')}
            appointments={appointments}
          />
        );
      case 'schedule':
        return (
          <Schedule
            onBack={() => setCurrentView('dashboard')}
            appointments={appointments}
            clients={clients}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        );
      case 'profile':
        return <Profile onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <Dashboard
            onViewChange={setCurrentView}
            onNotificationsClick={handleNotificationsClick}
            onProfileClick={() => setCurrentView('profile')}
            appointments={appointments}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full mx-auto max-w-[480px] bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar relative font-sans">
        {renderView()}
      </div>

      {session && currentView !== 'login' && currentView !== 'profile' && (
        <BottomNav currentView={currentView} onChangeView={setCurrentView} />
      )}
    </div>
  );
}