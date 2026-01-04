import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Cadastro realizado! Por favor, verifique seu email.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center px-6 py-8 min-h-[800px]">
      <div className="mb-6 flex justify-center">
        <div className="relative h-[80px] w-[120px] mx-auto font-display italic text-6xl text-primary select-none">
          <span className="absolute left-[10px] top-0 z-10">E</span>
          <span className="absolute left-[45px] top-[25px] text-[1.5rem] font-sans font-light text-black dark:text-white not-italic z-20">
            &
          </span>
          <span className="absolute right-[15px] top-[15px] z-10">R</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary mb-3">
          {isRegister ? 'Criar sua conta' : 'Bem-vindo(a) de volta!'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed px-4">
          {isRegister
            ? 'Crie sua conta para começar a gerenciar sua agenda.'
            : 'Insira seus dados para acessar sua agenda e marcar horários.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">mail</span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email"
            required
            className="w-full pl-11 pr-4 py-3.5 bg-transparent border border-input-border-light dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
            className="w-full pl-11 pr-11 py-3.5 bg-transparent border border-input-border-light dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        </div>

        {!isRegister && (
          <div className="flex justify-end pt-1">
            <a
              href="#"
              className="text-xs font-medium text-primary hover:text-pink-600 transition-colors"
            >
              Esqueci minha senha?
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-pink-600 disabled:bg-gray-400 text-white font-medium py-3.5 rounded-xl shadow-soft flex items-center justify-center gap-2 transition-transform active:scale-[0.98] duration-200 mt-2"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <>
              {isRegister ? 'Cadastrar' : 'Entrar'}
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-background-light dark:bg-background-dark text-gray-500 dark:text-gray-400">
            Ou continue com
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBozv5BIkfXRq6XsUAnZciCrrG13rezXxbz_h8pGoJWqPXDpTto9hvmwQCJj8vSRv2zzCEBzcaCc-XIs-8RKhc66w2-jkpKOEFxEcOrWQtBCFqZlFjyCllTF0pJRNC961lcG9dBWKLiOs9NAlzRKoqfBDt3LXAHUxVCr44czhYUuV7gWvCOSrfc164p6fhuGVH_gQI0uw5lG6zF8nXIpwjG2lbUKLVJL3-7WbiCvCgdFkKLSm8aUb4bHdsMMPjMCiqrI0c1FfiGLg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          Google
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="font-bold text-gray-900 dark:text-white hover:underline ml-1"
          >
            {isRegister ? 'Entrar' : 'Cadastre-se'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;