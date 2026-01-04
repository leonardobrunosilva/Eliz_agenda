import React, { useState, useRef, useMemo } from 'react';
import { Client } from '../types';
import Header from '../components/Header';
import Layout from '../components/Layout';

interface ClientsProps {
  onBack: () => void;
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onBulkAddClients: (clients: Client[]) => void;
}

const Clients: React.FC<ClientsProps> = ({ onBack, clients, onAddClient, onUpdateClient, onBulkAddClients }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', avatar: '' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredClients = useMemo(() => {
    return clients.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData({ ...formData, avatar: url });
    }
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', phone: '', avatar: '' });
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({ name: client.name, phone: client.phone, avatar: client.avatar });
    setPreviewUrl(client.avatar || null);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      alert('Por favor, preencha nome e telefone.');
      return;
    }

    const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        name: formData.name,
        phone: formData.phone,
        avatar: formData.avatar,
        initials: formData.avatar ? undefined : initials,
      });
    } else {
      const newClient: Client = {
        name: formData.name,
        phone: formData.phone,
        avatar: formData.avatar,
        vip: false,
        visits: 0,
        lastVisit: 'Novo',
        initials: formData.avatar ? undefined : initials,
      };
      onAddClient(newClient);
    }
    setShowModal(false);
  };

  const handleImport = async () => {
    // Check if the Contact Picker API is supported
    const supported = 'contacts' in navigator && 'ContactsManager' in window;

    if (!supported) {
      alert('Seu navegador não suporta a importação automática de contatos. Tente usar o Chrome no Android ou Safari no iOS.');
      return;
    }

    try {
      const props = ['name', 'tel'];
      const opts = { multiple: true };

      // @ts-ignore - navigator.contacts is not in standard ts types yet
      const contacts = await navigator.contacts.select(props, opts);

      if (contacts && contacts.length > 0) {
        const newClients: Client[] = contacts.map((contact: any) => {
          const name = contact.name[0] || 'Sem Nome';
          const phone = contact.tel[0] || '';
          const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

          return {
            name,
            phone,
            avatar: '',
            vip: false,
            visits: 0,
            lastVisit: 'Novo',
            initials: initials
          };
        });

        onBulkAddClients(newClients);
        alert(`${newClients.length} contatos importados com sucesso!`);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert('Erro ao importar contatos: ' + err.message);
      }
    }
  };

  return (
    <Layout className="px-4">
      <Header title="Clientes" showBack onBack={onBack} />

      {/* Search */}
      <div className="py-4 sticky top-[72px] z-10 bg-background-light dark:bg-background-dark">
        <label className="relative flex w-full items-center">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border-none bg-white dark:bg-card-dark py-3.5 pl-10 pr-4 text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-black/5 focus:ring-2 focus:ring-primary placeholder:text-text-secondary/60 transition-all"
            placeholder="Buscar por nome ou telefone..."
          />
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleImport}
          className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-card-dark border border-primary/20 hover:border-primary text-primary font-medium py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">cloud_download</span>
          <span className="text-sm font-semibold">Importar Contatos</span>
        </button>
        <button
          onClick={openAddModal}
          className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="text-sm font-semibold">Novo Cliente</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pt-2 pb-1 px-1">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Resultados ({filteredClients.length})
          </span>
        </div>

        {filteredClients.map((client) => (
          <div
            key={client.id}
            onClick={() => openEditModal(client)}
            className="group relative flex items-center gap-4 bg-white dark:bg-card-dark p-3 rounded-2xl shadow-card border border-transparent hover:border-primary/20 transition-all cursor-pointer hover:shadow-md"
          >
            <div className="relative shrink-0">
              {client.avatar ? (
                <div
                  className="h-14 w-14 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm"
                  style={{ backgroundImage: `url('${client.avatar}')` }}
                ></div>
              ) : (
                <div className={`h-14 w-14 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white dark:border-gray-700 shadow-sm ${client.bg || 'bg-primary/10 text-primary'}`}>
                  {client.initials}
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-text-main dark:text-white text-base font-bold truncate">
                  {client.name}
                </p>
                {client.vip && (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">VIP</span>
                )}
              </div>
              <p className="text-text-muted text-sm truncate">{client.phone}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-text-muted/80">
                <span className="material-symbols-outlined text-[14px]">history</span>
                <span>{client.visits} visitas • Última: {client.lastVisit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
          <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="relative transform overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white dark:bg-card-dark text-left shadow-xl transition-all w-full max-w-lg h-[85vh] sm:h-auto flex flex-col">
              <div className="bg-white dark:bg-card-dark px-4 py-4 sm:px-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-main dark:text-white">
                  {editingClient ? 'Editar Cliente' : 'Cadastrar Cliente'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="px-4 py-6 sm:p-6 flex-1 overflow-y-auto">
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30 group-hover:border-primary transition-colors overflow-hidden">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-3xl text-primary">add_a_photo</span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 shadow-md">
                        <span className="material-symbols-outlined text-xs">edit</span>
                      </div>
                    </div>
                    <span className="text-xs text-text-muted mt-2">Escolher foto</span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main dark:text-white">Nome Completo</label>
                    <div className="mt-1 relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">person</span>
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full rounded-xl border-0 py-3 pl-10 text-text-main ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-primary bg-background-light/50 dark:bg-gray-900 sm:text-sm dark:text-white"
                        placeholder="Ex: Maria Silva"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main dark:text-white">Telefone</label>
                    <div className="mt-1 relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">call</span>
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="block w-full rounded-xl border-0 py-3 pl-10 text-text-main ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-primary bg-background-light/50 dark:bg-gray-900 sm:text-sm dark:text-white"
                        placeholder="(XX) XXXXX-XXXX"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 pb-8 sm:pb-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex w-full justify-center rounded-xl bg-primary px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-dark sm:ml-3 sm:w-auto min-w-[120px]"
                >
                  Salvar
                </button>
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
    </Layout>
  );
};

export default Clients;