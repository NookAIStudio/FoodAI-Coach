
import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { ChevronLeft, Shield, FileText, Activity, CreditCard, Lock, Info, Mail } from 'lucide-react';

interface LegalViewProps {
  language: Language;
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ language, onBack }) => {
  const t = translations[language] || translations['pt-PT'];
  const lV = t.legalView;

  const sections = [
    { icon: <Shield size={20} className="text-emerald-500" />, ...lV.privacy },
    { icon: <FileText size={20} className="text-blue-500" />, ...lV.terms },
    { icon: <Activity size={20} className="text-red-500" />, ...lV.health },
    { icon: <CreditCard size={20} className="text-amber-500" />, ...lV.subscriptions },
    { icon: <Lock size={20} className="text-indigo-500" />, ...lV.dataSafety },
    { icon: <Info size={20} className="text-slate-500" />, ...lV.compliance },
  ];

  return (
    <div className="pb-24 animate-fade-in space-y-6 max-w-2xl mx-auto px-1 text-slate-900">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold">{t.profile.legal}</h2>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-xl">
                {section.icon}
              </div>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">{section.title}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <Mail size={20} className="text-emerald-400" />
          <h3 className="font-bold text-xs uppercase tracking-widest">{lV.supportTitle}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          {lV.supportText}
        </p>
        <a 
          href="mailto:nook.ai.studio@gmail.com" 
          className="text-emerald-400 font-bold hover:underline"
        >
          nook.ai.studio@gmail.com
        </a>
      </div>

      <div className="text-center text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] py-8">
        {lV.footer}
      </div>
    </div>
  );
};
