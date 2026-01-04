import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Layout from '../components/Layout';
import { Appointment, Client } from '../types';

interface ScheduleProps {
  onBack: () => void;
  appointments: Appointment[];
  clients: Client[];
  onAddAppointment: (app: Appointment) => void;
  onUpdateAppointment: (app: Appointment, mode?: 'single' | 'future') => void;
  onDeleteAppointment: (id: string, mode?: 'single' | 'series') => void;
}

const SERVICES = ['Pé', 'Pé e Mão', 'Mão', 'Sobrancelha', 'Depilação'];

const Schedule: React.FC<ScheduleProps> = ({
  onBack,
  appointments,
  clients,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    service: '',
    time: '',
    price: '',
    date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD local
    paymentMethod: 'Dinheiro' as 'Dinheiro' | 'PIX' | 'Mensal',
    status: 'pending' as 'confirmed' | 'pending',
    is_recurring: false
  });
  const [showRecurrenceModal, setShowRecurrenceModal] = useState<'edit' | 'delete' | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // Filter appointments by selected date
  const filteredAppointments = useMemo(() => {
    const selectedISODate = selectedDate.toLocaleDateString('en-CA');
    return appointments.filter(app => app.dateStr === selectedISODate);
  }, [appointments, selectedDate]);

  // Week helper logic
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to start on Monday
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const weekLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

  const filteredClients = useMemo(() => {
    if (!clientSearch) return [];
    return clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 5);
  }, [clients, clientSearch]);

  const handleOpenModal = (app?: Appointment) => {
    if (app) {
      setEditingAppointment(app);
      setFormData({
        clientName: app.clientName,
        service: app.service,
        time: app.time,
        price: app.price.toString(),
        date: app.dateStr,
        paymentMethod: app.paymentMethod || 'Dinheiro',
        status: app.status || 'pending',
        is_recurring: app.is_recurring || false
      });
      setClientSearch(app.clientName);
    } else {
      setEditingAppointment(null);
      setFormData({
        clientName: '',
        service: '',
        time: '',
        price: '',
        date: selectedDate.toLocaleDateString('en-CA'),
        paymentMethod: 'Dinheiro',
        status: 'pending',
        is_recurring: false
      });
      setClientSearch('');
    }
    setShowModal(true);
    setShowClientSuggestions(false);
  };

  const handleSelectClient = (client: Client) => {
    setClientSearch(client.name);
    setFormData({ ...formData, clientName: client.name });
    setShowClientSuggestions(false);
  };

  const handleSave = () => {
    if (!clientSearch || !formData.time || !formData.service || !formData.date) {
      alert('Por favor, preencha cliente, serviço, data e horário.');
      return;
    }

    const selectedClient = clients.find(c => c.name === clientSearch);

    if (editingAppointment) {
      if (editingAppointment.series_id) {
        setShowRecurrenceModal('edit');
      } else {
        onUpdateAppointment({
          ...editingAppointment,
          clientName: clientSearch,
          service: formData.service,
          time: formData.time,
          price: Number(formData.price),
          dateStr: formData.date,
          avatar: selectedClient?.avatar || '',
          paymentMethod: formData.paymentMethod,
          status: formData.status,
        });
        setShowModal(false);
      }
    } else {
      const newApp: Appointment = {
        clientName: clientSearch,
        service: formData.service,
        time: formData.time,
        price: Number(formData.price),
        dateStr: formData.date,
        avatar: selectedClient?.avatar || '',
        initials: clientSearch.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        is_recurring: formData.is_recurring
      };
      onAddAppointment(newApp);
      setShowModal(false);
    }
  };

  const confirmUpdate = (mode: 'single' | 'future') => {
    if (!editingAppointment) return;
    const selectedClient = clients.find(c => c.name === clientSearch);

    onUpdateAppointment({
      ...editingAppointment,
      clientName: clientSearch,
      service: formData.service,
      time: formData.time,
      price: Number(formData.price),
      dateStr: formData.date,
      avatar: selectedClient?.avatar || '',
      paymentMethod: formData.paymentMethod,
      status: formData.status,
    }, mode);
    setShowRecurrenceModal(null);
    setShowModal(false);
  };

  const handleDelete = () => {
    if (!editingAppointment?.id) return;
    if (editingAppointment.series_id) {
      setShowRecurrenceModal('delete');
    } else {
      if (confirm(`Deseja realmente excluir o agendamento de ${editingAppointment.clientName}?`)) {
        onDeleteAppointment(editingAppointment.id);
        setShowModal(false);
      }
    }
  };

  const confirmDelete = (mode: 'single' | 'series') => {
    if (!editingAppointment?.id) return;
    onDeleteAppointment(editingAppointment.id, mode);
    setShowRecurrenceModal(null);
    setShowModal(false);
  };

  const moveWeek = (dir: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (dir * 7));
    setSelectedDate(newDate);
  };

  const monthLabel = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Layout>
      <Header
        title="Agenda"
        showBack
        onBack={onBack}
        rightIcon="calendar_month"
        onRightClick={() => setSelectedDate(new Date())}
      />

      {/* Week Selector */}
      <div className="px-4 py-4">
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-card border border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => moveWeek(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-text-muted">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <span className="text-sm font-bold text-text-main dark:text-white capitalize">{monthLabel}</span>
            <button onClick={() => moveWeek(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-text-muted">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekLabels.map((l, i) => (
              <span key={i} className="text-[10px] font-bold text-text-muted uppercase">{l}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((date, i) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(new Date(date))}
                  className={`h-10 w-full flex items-center justify-center rounded-lg text-sm transition-all ${isSelected
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold'
                    : 'text-text-main dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-6 mt-2 pb-24">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
            <h3 className="text-text-main dark:text-white text-lg font-bold">
              Agendamentos para {selectedDate.toLocaleDateString('pt-BR')}
            </h3>
          </div>

          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((app, index) => (
                <div key={app.id || `app-${index}`} className="group relative flex gap-3">
                  <div className="w-14 shrink-0 flex flex-col items-center pt-2">
                    <span className="text-sm font-bold text-text-main dark:text-white">{app.time}</span>
                  </div>
                  <div
                    onClick={() => handleOpenModal(app)}
                    className="flex-1 bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-soft border-l-4 border-primary flex justify-between items-center cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      {app.avatar ? (
                        <div className="size-12 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm" style={{ backgroundImage: `url('${app.avatar}')` }}></div>
                      ) : (
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-white dark:border-gray-700">
                          {app.initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-text-main dark:text-white text-base truncate">{app.clientName}</h4>
                          {app.series_id && (
                            <span className="material-symbols-outlined text-[16px] text-pink-400" title="Recorrente">sync</span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-primary mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">spa</span>
                          {app.service}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="block text-sm font-bold text-text-main dark:text-white">R$ {app.price}</span>
                      {app.status === 'confirmed' && (
                        <span className="inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                          Conf.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-text-muted italic">Nenhum agendamento para este dia.</div>
            )}

            <div className="group relative flex gap-3">
              <div className="w-14 shrink-0 flex flex-col items-center pt-3">
                <span className="text-sm font-bold text-text-muted">Livre</span>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="flex-1 border-2 border-dashed border-primary/30 rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary transition-all group"
              >
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </div>
                <span className="text-sm font-bold text-primary/80 group-hover:text-primary">Disponível para agendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-pink-600 transition-colors z-[60]"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
          <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="relative transform overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white dark:bg-card-dark text-left shadow-xl transition-all w-full max-w-lg">
              <div className="bg-white dark:bg-card-dark px-4 py-4 sm:px-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-main dark:text-white">
                  {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="px-4 py-6 sm:p-6 space-y-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-text-main dark:text-white uppercase tracking-wider mb-1">Cliente</label>
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setShowClientSuggestions(true);
                    }}
                    onFocus={() => setShowClientSuggestions(true)}
                    className="mt-1 block w-full rounded-xl border-0 py-3 px-4 text-text-main ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-primary bg-background-light/50 dark:bg-gray-900 dark:text-white transition-all shadow-sm"
                    placeholder="Buscar cliente existente..."
                  />
                  {showClientSuggestions && filteredClients.length > 0 && (
                    <div className="absolute z-[110] w-full mt-1 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1">
                      {filteredClients.map(c => (
                        <button
                          key={c.id}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3"
                          onClick={() => handleSelectClient(c)}
                        >
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {c.initials || c.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white">{c.name}</p>
                            <p className="text-xs text-text-muted">{c.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main dark:text-white uppercase tracking-wider mb-1">Serviço</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="mt-1 block w-full rounded-xl border-0 py-3 px-4 text-text-main ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-primary bg-background-light/50 dark:bg-gray-900 dark:text-white shadow-sm"
                  >
                    <option value="">Selecione um serviço</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-main dark:text-white uppercase tracking-wider mb-1">Data</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1 block w-full rounded-xl border-0 py-3 px-4 text-text-main ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-primary bg-background-light/50 dark:bg-gray-900 dark:text-white shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main dark:text-white uppercase tracking-wider mb-1">Horário</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-1 block w-full rounded-xl border-0 py-3 px-4 text-text-main ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-primary bg-background-light/50 dark:bg-gray-900 dark:text-white shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-main dark:text-white uppercase tracking-wider mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full rounded-xl border-0 py-3 px-4 text-text-main ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-primary bg-background-light/50 dark:bg-gray-900 dark:text-white shadow-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main dark:text-white uppercase tracking-wider mb-1">Forma de Pagamento</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="mt-1 block w-full rounded-xl border-0 py-3 px-4 text-text-main ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-primary bg-background-light/50 dark:bg-gray-900 dark:text-white shadow-sm"
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="PIX">PIX</option>
                      <option value="Mensal">Mensal</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500">task_alt</span>
                    <span className="text-sm font-bold text-text-main dark:text-white">Confirmar Agendamento</span>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, status: formData.status === 'confirmed' ? 'pending' : 'confirmed' })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.status === 'confirmed' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.status === 'confirmed' ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {!editingAppointment && (
                  <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-900/10 rounded-xl border border-pink-100 dark:border-pink-900/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">sync</span>
                      <span className="text-sm font-bold text-text-main dark:text-white">Repetir semanalmente?</span>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, is_recurring: !formData.is_recurring })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.is_recurring ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_recurring ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 pb-8 sm:pb-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex w-full justify-center rounded-xl bg-primary px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-dark sm:ml-3 sm:w-auto min-w-[120px]"
                >
                  Salvar
                </button>
                {editingAppointment && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="mt-3 sm:mt-0 sm:ml-3 inline-flex w-full justify-center rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-3 text-sm font-bold text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-red-200 dark:ring-red-900/30 hover:bg-red-100 sm:w-auto min-w-[100px]"
                  >
                    Excluir
                  </button>
                )}
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-xl bg-white dark:bg-gray-700 px-3 py-3 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 sm:mt-0 sm:w-auto min-w-[100px]"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Recurrence Choice Modal */}
      {showRecurrenceModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRecurrenceModal(null)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold dark:text-white mb-2">Agendamento Recorrente</h3>
            <p className="text-sm text-text-muted mb-6">
              Este agendamento faz parte de uma série. O que você deseja fazer?
            </p>
            <div className="space-y-3">
              {showRecurrenceModal === 'edit' ? (
                <>
                  <button
                    onClick={() => confirmUpdate('single')}
                    className="w-full py-3 bg-white dark:bg-gray-800 border-2 border-primary/20 text-primary rounded-xl font-bold hover:bg-primary/5 transition-colors"
                  >
                    Alterar apenas este evento
                  </button>
                  <button
                    onClick={() => confirmUpdate('future')}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-soft hover:bg-primary-dark transition-colors"
                  >
                    Alterar este e todos os futuros
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => confirmDelete('single')}
                    className="w-full py-3 bg-white dark:bg-gray-800 border-2 border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors"
                  >
                    Excluir apenas este evento
                  </button>
                  <button
                    onClick={() => confirmDelete('series')}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow-soft hover:bg-red-700 transition-colors"
                  >
                    Excluir toda a série
                  </button>
                </>
              )}
              <button
                onClick={() => setShowRecurrenceModal(null)}
                className="w-full py-3 text-text-muted font-semibold hover:text-text-main"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Schedule;