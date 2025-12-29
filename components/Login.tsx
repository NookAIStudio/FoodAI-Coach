
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Mail, Lock, ArrowRight, Apple, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGoToRegister, language, onLanguageChange }) => {
  const t = translations[language] || translations['pt-PT'] || (Object.values(translations)[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      setError(t.errors?.fillAll || 'Fill all fields');
      return;
    }

    const result = authService.login(email, password);
    if (result.success) {
      onLoginSuccess();
    } else {
      setError(t.errors?.invalidLogin || 'Invalid login');
    }
  };

  const handleGoogleLogin = () => {
    setIsLoadingGoogle(true);
    setTimeout(() => {
      const existingUsers = authService.getUsers();
      if (existingUsers.length > 0) {
        const result = authService.login(existingUsers[0].email!, "google-auth-placeholder");
        onLoginSuccess();
      } else {
        setError(t.errors?.invalidLogin || "No accounts found.");
      }
      setIsLoadingGoogle(false);
    }, 1500);
  };

  if (!t) return null;

  const languageOptions = [
    { id: 'pt-PT', f: '🇵🇹' },
    { id: 'pt-BR', f: '🇧🇷' },
    { id: 'en', f: '🇺🇸' },
    { id: 'es', f: '🇪🇸' },
    { id: 'fr', f: '🇫🇷' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden p-8 animate-fade-in border border-slate-200">
        <div className="flex justify-center gap-2 mb-6">
          {languageOptions.map((l) => (
            <button
              key={l.id}
              onClick={() => onLanguageChange(l.id as Language)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all border-2 
                ${language === l.id ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              {l.f}
            </button>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <Apple size={48} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t.login}</h2>
          <p className="text-slate-500 mt-2">{t.welcome}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isLoadingGoogle ? (
              <Loader2 className="animate-spin text-emerald-500" size={24} />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>{t.continueWithGoogle}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email & Password</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="relative group">
            <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="email" 
              className="w-full pl-10 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder={t.email}
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="password" 
              className="w-full pl-10 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder={t.password}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-50 border border-red-100 p-2 rounded-lg">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
          >
            {t.loginButton} <ArrowRight className="ml-2" size={20} />
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-slate-500">
            {t.noAccount}{' '}
            <button onClick={onGoToRegister} className="text-emerald-600 font-bold hover:underline transition-colors">
              {t.registerNow}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
