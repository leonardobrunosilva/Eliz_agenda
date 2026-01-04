import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface ProfileProps {
    onBack: () => void;
    darkMode: boolean;
    onToggleDarkMode: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack, darkMode, onToggleDarkMode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [activeModal, setActiveModal] = useState<'personal' | 'settings' | 'notifications' | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [displayName, setDisplayName] = useState('');
    const [phone, setPhone] = useState('');
    const [notifNewApp, setNotifNewApp] = useState(true);
    const [notifReminders, setNotifReminders] = useState(true);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setDisplayName(user.user_metadata?.full_name || 'Usuário');
                setPhone(user.user_metadata?.phone || '');
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert('Erro ao sair: ' + error.message);
        }
    };

    const handleUpdatePersonal = async () => {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            data: { full_name: displayName, phone: phone }
        });

        if (error) {
            alert('Erro ao atualizar: ' + error.message);
        } else {
            alert('Dados atualizados com sucesso!');
            setActiveModal(null);
        }
        setLoading(false);
    };

    const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para fazer o upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) {
                throw updateError;
            }

            alert('Foto de perfil atualizada com sucesso!');

            // Refresh user data
            const { data: { user: updatedUser } } = await supabase.auth.getUser();
            setUser(updatedUser);

        } catch (error: any) {
            alert('Erro no upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const Toggle = ({ enabled, setEnabled, id }: { enabled: boolean, setEnabled: (v: boolean) => void, id?: string }) => (
        <button
            id={id}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );

    return (
        <Layout>
            <Header title="Meu Perfil" showBack onBack={onBack} />
            <div className="px-6 py-8 flex flex-col items-center pb-24">
                <div className="relative group">
                    <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-slate-200 relative">
                        <img
                            src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"}
                            alt="Foto de perfil"
                            className="h-full w-full object-cover"
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="material-symbols-outlined animate-spin text-white">sync</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">edit</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUploadAvatar}
                        className="hidden"
                        accept="image/*"
                    />
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{displayName}</h2>
                <p className="text-slate-500 text-sm">{user?.email}</p>

                <div className="w-full mt-10 space-y-4">
                    <button
                        onClick={() => setActiveModal('personal')}
                        className="w-full flex items-center justify-between p-5 bg-white dark:bg-card-dark rounded-2xl shadow-soft hover:shadow-md transition-all border border-transparent hover:border-primary/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-gray-200">Dados Pessoais</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </button>

                    <button
                        onClick={() => setActiveModal('settings')}
                        className="w-full flex items-center justify-between p-5 bg-white dark:bg-card-dark rounded-2xl shadow-soft hover:shadow-md transition-all border border-transparent hover:border-primary/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">settings</span>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-gray-200">Configurações</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </button>

                    <button
                        onClick={() => setActiveModal('notifications')}
                        className="w-full flex items-center justify-between p-5 bg-white dark:bg-card-dark rounded-2xl shadow-soft hover:shadow-md transition-all border border-transparent hover:border-primary/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-pink-600 dark:text-pink-400 text-[20px]">notifications</span>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-gray-200">Notificações</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl mt-8 cursor-pointer hover:bg-red-100 transition-colors group"
                    >
                        <div className="flex items-center gap-4 text-red-600">
                            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200">
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </div>
                            <span className="font-bold">Sair da Conta</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Modals */}
            {activeModal === 'personal' && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-card-dark rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Dados Pessoais</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full p-3 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white border focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Telefone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-3 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white border focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <button
                                onClick={handleUpdatePersonal}
                                disabled={loading}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-soft hover:bg-primary-dark transition-colors disabled:opacity-50 mt-4"
                            >
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'settings' && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-card-dark rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Configurações</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold dark:text-white">Modo Escuro</p>
                                    <p className="text-xs text-slate-500">Alternar tema do aplicativo</p>
                                </div>
                                <Toggle enabled={darkMode} setEnabled={onToggleDarkMode} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold dark:text-white">Idioma</p>
                                    <p className="text-xs text-slate-500">Português (Brasil)</p>
                                </div>
                                <span className="text-sm font-bold text-primary">Alterar</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'notifications' && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-card-dark rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Notificações</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold dark:text-white">Novos Agendamentos</p>
                                    <p className="text-xs text-slate-500">Receber avisos de reservas</p>
                                </div>
                                <Toggle enabled={notifNewApp} setEnabled={setNotifNewApp} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold dark:text-white">Lembretes</p>
                                    <p className="text-xs text-slate-500">Avisar antes dos atendimentos</p>
                                </div>
                                <Toggle enabled={notifReminders} setEnabled={setNotifReminders} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Profile;
