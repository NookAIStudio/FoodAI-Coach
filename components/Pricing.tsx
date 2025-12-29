
import React from 'react';
import { Check, Star, Crown, Zap, ShieldCheck, CalendarCheck } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface PricingProps {
  language: Language;
  onUpgrade: (plan: 'intermediate' | 'premium' | 'annual') => void;
  currentPlan?: string;
}

export const Pricing: React.FC<PricingProps> = ({ language, onUpgrade, currentPlan }) => {
  // Defensive translation lookup with multiple fallbacks
  const t = (translations && language && translations[language]) 
    ? translations[language] 
    : (translations['pt-PT'] || Object.values(translations)[0]);

  // If t or t.premium is missing, show a fallback loader rather than crashing
  if (!t || !t.premium) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const { premium } = t;

  return (
    <div className="pb-24 space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="text-center space-y-4 pt-8 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{premium.title}</h2>
        <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
          {premium.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-end mt-4 px-2">
        
        {/* Intermediate Plan */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative hover:shadow-md transition-shadow h-auto order-1">
          <h3 className="text-lg font-bold text-slate-900 mb-2">{premium.intermediate?.name}</h3>
          <div className="mb-6">
            <span className="text-3xl font-bold text-slate-900">{premium.intermediate?.price}</span>
          </div>
          
          <ul className="space-y-4 mb-8">
            {premium.intermediate?.features?.map((feature: string, i: number) => (
              <li key={i} className="flex items-start text-slate-600 text-sm">
                <Check size={18} className="text-emerald-500 mr-3 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <button 
            disabled={['intermediate', 'premium', 'annual'].includes(currentPlan || '')}
            onClick={() => onUpgrade('intermediate')}
            className={`w-full py-4 rounded-xl border-2 font-bold transition-all text-sm
              ${['intermediate', 'premium', 'annual'].includes(currentPlan || '') 
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-default' 
                : 'border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
          >
            {currentPlan === 'intermediate' ? "Plano Atual" : (['premium', 'annual'].includes(currentPlan || '') ? "Upgrade Ativo" : premium.intermediate?.button)}
          </button>
        </div>

        {/* Premium Plan - Highlighted (Most Popular) */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white transform scale-105 border-4 border-emerald-500 z-10 order-first md:order-2">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-lg">
            {premium.pro?.badge}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Crown className="text-yellow-400" size={24} fill="currentColor" />
            <h3 className="text-xl font-bold">{premium.pro?.name}</h3>
          </div>
          
          <div className="mb-6">
            <span className="text-4xl font-bold">{premium.pro?.price}</span>
          </div>
          
          <ul className="space-y-4 mb-8">
            {premium.pro?.features?.map((feature: string, i: number) => (
              <li key={i} className="flex items-start text-slate-300 text-sm">
                <div className="bg-emerald-500/20 p-1 rounded-full mr-3 mt-0.5 shrink-0">
                   <Check size={12} className="text-emerald-400" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <button 
            disabled={['premium', 'annual'].includes(currentPlan || '')}
            onClick={() => onUpgrade('premium')}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 group
              ${['premium', 'annual'].includes(currentPlan || '')
                ? 'bg-slate-800 text-slate-500 shadow-none cursor-default'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'}`}
          >
            <Zap size={20} className={['premium', 'annual'].includes(currentPlan || '') ? 'hidden' : 'group-hover:text-yellow-200 transition-colors'} fill="currentColor" />
            {currentPlan === 'premium' ? "Plano Atual" : (currentPlan === 'annual' ? "Upgrade Ativo" : premium.pro?.button)}
          </button>
          
          <div className="text-center mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
             <ShieldCheck size={14} /> {premium.secure}
          </div>
        </div>

        {/* Annual Plan */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm relative hover:shadow-md transition-shadow h-auto order-3">
           <div className="absolute -top-3 left-6 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
             {premium.annual?.discount}
           </div>

           <div className="flex items-center gap-2 mb-2 text-amber-600 mt-2">
             <CalendarCheck size={20} />
             <h3 className="text-lg font-bold">{premium.annual?.name}</h3>
           </div>
          
          <div className="mb-1">
            <span className="text-3xl font-bold text-slate-900">{premium.annual?.price}</span>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">{premium.annual?.subtitle}</p>
          
          <ul className="space-y-4 mb-8">
            {premium.annual?.features?.map((feature: string, i: number) => (
              <li key={i} className="flex items-start text-slate-600 text-sm">
                <Check size={18} className="text-amber-500 mr-3 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <button 
            disabled={currentPlan === 'annual'}
            onClick={() => onUpgrade('annual')}
            className={`w-full py-4 rounded-xl font-bold border transition-all text-sm
              ${currentPlan === 'annual'
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-default'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100'}`}
          >
            {currentPlan === 'annual' ? "Plano Atual" : premium.annual?.button}
          </button>
        </div>

      </div>
    </div>
  );
};
