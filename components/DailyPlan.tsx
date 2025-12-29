
import React, { useState } from 'react';
import { generateDailyPlan } from '../services/geminiService';
import { DailyPlan, UserProfile, Language } from '../types';
import { Dumbbell, Utensils, Sparkles, Check, ChevronRight, Flame, Target, Lock } from 'lucide-react';
import { translations } from '../data/translations';

interface DailyPlanViewProps {
  user: UserProfile;
  language: Language;
  onGoToPremium: () => void;
}

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({ user, language, onGoToPremium }) => {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile>(user);

  const handleGenerate = async () => {
    if (!user.isPremium) return;
    setLoading(true);
    try {
      const newPlan = await generateDailyPlan(localProfile);
      setPlan(newPlan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // PREMIUM LOCK OVERLAY FOR FREE USERS
  if (!user.isPremium && !plan) {
    return (
      <div className="max-w-xl mx-auto pb-20 px-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lock size={120} />
          </div>
          
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <Sparkles size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">{t.dailyPlanner.title}</h2>
            <p className="text-slate-600">
              {t.dailyPlanner.premiumRequired}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl space-y-4 text-left border border-slate-100">
             <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
               <Check size={16} className="text-emerald-500" /> Planos de Treino Personalizados
             </h4>
             <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
               <Check size={16} className="text-emerald-500" /> Sugestões de Refeições com IA
             </h4>
             <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
               <Check size={16} className="text-emerald-500" /> Foco Diário Adaptativo
             </h4>
          </div>

          <button
            onClick={onGoToPremium}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Lock size={20} /> {t.dashboard.upgradeNow}
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-xl mx-auto pb-20 px-4">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-slate-900">{t.dailyPlanner.title}</h2>
          <p className="text-slate-600">{t.dailyPlanner.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
               <Target size={18} />
               <span>Target: {localProfile.targets.calories} kcal</span>
             </div>
             <div className="text-xs text-indigo-500 flex gap-3">
               <span>P: {localProfile.targets.protein}g</span>
               <span>C: {localProfile.targets.carbs}g</span>
               <span>F: {localProfile.targets.fat}g</span>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.dailyPlanner.goalLabel}</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { val: 'lose_weight', label: t.goals.lose_weight, icon: Flame },
                { val: 'gain_muscle', label: t.goals.gain_muscle, icon: Dumbbell },
                { val: 'maintain', label: t.goals.maintain, icon: Check }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setLocalProfile({ ...localProfile, goal: opt.val as any })}
                  className={`flex items-center p-4 rounded-xl border transition-all text-left
                    ${localProfile.goal === opt.val 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500' 
                      : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className={`p-2 rounded-full mr-4 ${localProfile.goal === opt.val ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <opt.icon size={20} />
                  </div>
                  <span className="font-medium">{opt.label}</span>
                  {localProfile.goal === opt.val && <Check className="ml-auto text-emerald-600" size={20} />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Sparkles className="animate-spin" />
                <span>{t.dailyPlanner.buttonLoading}</span>
              </>
            ) : (
              <>
                <Sparkles />
                <span>{t.dailyPlanner.buttonGenerate}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">{t.dailyPlanner.resultTitle}</h2>
        <button 
          onClick={() => setPlan(null)}
          className="text-sm text-emerald-600 font-medium hover:text-emerald-700 hover:underline"
        >
          {t.dailyPlanner.createNew}
        </button>
      </div>

      <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Sparkles size={120} />
        </div>
        <h3 className="text-lg font-semibold opacity-90 mb-2">{t.dailyPlanner.focus}</h3>
        <p className="text-xl md:text-2xl font-bold leading-relaxed">"{plan.summary}"</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 mb-2">
            <Utensils className="text-emerald-600" />
            <h3 className="text-xl font-bold">{t.dailyPlanner.meals}</h3>
          </div>
          {plan.meals.map((meal, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold tracking-wide text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded">
                  {meal.type}
                </span>
                <span className="text-sm text-slate-400 font-mono">{meal.calories} kcal</span>
              </div>
              <h4 className="font-bold text-slate-800 text-lg mb-1">{meal.name}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{meal.description}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 mb-2">
            <Dumbbell className="text-blue-600" />
            <h3 className="text-xl font-bold">{t.dailyPlanner.workout}</h3>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
             {plan.workout.map((exercise, idx) => (
               <div key={idx} className="p-5 border-b last:border-b-0 border-slate-100 hover:bg-slate-50 transition-colors">
                 <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-slate-800">{exercise.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                      ${exercise.intensity === 'Alta' ? 'bg-red-100 text-red-700' : 
                        exercise.intensity === 'Média' ? 'bg-amber-100 text-amber-700' : 
                        'bg-green-100 text-green-700'}`}>
                      {exercise.intensity}
                    </span>
                 </div>
                 <div className="flex items-center text-sm text-slate-500 mb-2">
                   <span className="font-mono bg-slate-100 px-2 py-0.5 rounded mr-2">{exercise.duration}</span>
                 </div>
                 <p className="text-sm text-slate-600">{exercise.description}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
