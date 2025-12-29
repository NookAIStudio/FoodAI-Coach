
import React, { useState } from 'react';
import { DiaryEntry, UserProfile, DailyAnalysisResult, WeeklyPlan } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, CheckCircle, XCircle, Calendar, X, Lock, Loader2, Trash2, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { translations } from '../data/translations';
import { analyzeDailyIntake } from '../services/geminiService';

interface FoodDiaryProps {
  diary: DiaryEntry[];
  user: UserProfile;
  onDelete: (id: string) => void;
  savedPlans: WeeklyPlan[];
  onDeletePlan: (id: string) => void;
  onRenamePlan?: (id: string, newTitle: string) => void;
  onGoToPremium: () => void;
}

type Tab = 'history' | 'plans';

export const FoodDiary: React.FC<FoodDiaryProps> = ({ diary, user, onDelete, savedPlans, onDeletePlan, onGoToPremium }) => {
  const t = translations[user.language] || translations['pt-PT'];
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [analyzingDate, setAnalyzingDate] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, DailyAnalysisResult>>({});
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const groupedDiary = diary.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, DiaryEntry[]>);

  const dates = Object.keys(groupedDiary).sort().reverse();

  const handleAnalyzeDay = async (date: string) => {
    // Only Premium or Annual plan can analyze daily intake
    const canAnalyze = user.planType === 'premium' || user.planType === 'annual';
    if (!canAnalyze) { onGoToPremium(); return; }
    
    setAnalyzingDate(date);
    try {
      const result = await analyzeDailyIntake(user, groupedDiary[date]);
      setAnalysisResults(prev => ({ ...prev, [date]: result }));
    } catch (e) { console.error(e); } 
    finally { setAnalyzingDate(null); }
  };

  const formatScore = (score: number) => {
    // Correcting to 2.0/10 style
    const value = score > 10 ? score / 10 : score;
    return value.toFixed(1).replace('.', user.language === 'en' ? '.' : ',');
  };

  return (
    <div className="pb-24 animate-fade-in text-slate-900">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 shadow-inner">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all
            ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {t.diary.title}
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all
            ${activeTab === 'plans' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {t.weeklyPlanner.savedPlans}
        </button>
      </div>

      {activeTab === 'history' ? (
        <>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t.diary.title}</h2>
            <div className="flex items-center bg-white rounded-full border border-slate-200 px-3 py-1.5 shadow-sm text-sm font-medium text-slate-600 gap-2">
               <button className="p-1 hover:bg-slate-50 rounded-full"><ChevronLeft size={18} /></button>
               <div className="flex items-center gap-1.5 font-bold"><CalendarIcon size={16} /> {t.diary.thisMonth}</div>
               <button className="p-1 hover:bg-slate-50 rounded-full"><ChevronRight size={18} /></button>
            </div>
          </div>

          {dates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm"><p className="text-slate-500">{t.diary.empty}</p></div>
          ) : (
            <div className="space-y-10">
              {dates.map(date => {
                const dayTotal = groupedDiary[date].reduce((sum, item) => sum + item.macros.calories, 0);
                const dateObj = new Date(date);
                const prettyDate = dateObj.toLocaleDateString(user.language, { weekday: 'long', day: 'numeric', month: 'long' });
                const result = analysisResults[date];
                const isAnalyzing = analyzingDate === date;
                const isAllowedPlan = user.planType === 'premium' || user.planType === 'annual';
                
                return (
                  <div key={date} className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="font-bold text-slate-900 capitalize text-sm">{prettyDate}</h3>
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{t.diary.total}: {dayTotal} kcal</span>
                    </div>
                    
                    <div className="bg-slate-50/50 p-4 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                      <div className="bg-white rounded-[2rem] divide-y divide-slate-100 overflow-hidden border border-slate-100">
                        {groupedDiary[date].map(entry => (
                          <div key={entry.id} className="p-4 flex gap-4 items-center group relative hover:bg-slate-50/50 transition-colors">
                            <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner">
                               {entry.image ? <img src={entry.image} className="w-full h-full object-cover" alt={entry.foodName} /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-[8px] font-bold bg-slate-100 uppercase text-center px-1">Sem Foto</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="max-w-[85%]">
                                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight leading-tight">{entry.foodName}</h4>
                                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{entry.mealType}</p>
                                </div>
                                <button 
                                  onClick={() => onDelete(entry.id)} 
                                  className="text-slate-300 hover:text-red-500 transition-colors p-1.5 bg-white hover:bg-red-50 rounded-full shadow-sm border border-slate-100"
                                  title="Remover refeição"
                                >
                                  <X size={14} strokeWidth={3} />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex gap-3 text-[10px] text-slate-500 font-bold tracking-tight border border-slate-100 rounded-lg px-2 py-0.5">
                                   <span>P: {entry.macros.protein}g</span>
                                   <span>C: {entry.macros.carbs}g</span>
                                   <span>F: {entry.macros.fat}g</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="font-mono text-sm font-bold text-slate-900 leading-none">{entry.macros.calories}</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">kcal</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {result ? (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-5 space-y-4 animate-fade-in shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm uppercase tracking-wider"><Sparkles size={18} /> {t.diary.dailyAnalysis}</div>
                            <div className="flex flex-col items-end">
                               <span className="text-[9px] font-bold text-indigo-300 uppercase leading-none">Score</span>
                               <span className="text-2xl font-bold text-indigo-600 leading-none mt-1">{formatScore(result.score)}/10</span>
                            </div>
                          </div>
                          <p className="text-sm text-indigo-800 italic leading-relaxed">"{result.summary}"</p>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white/60 p-3 rounded-2xl border border-indigo-100/50 shadow-sm">
                               <h5 className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1 mb-2"><CheckCircle size={12}/> POSITIVO</h5>
                               <ul className="text-[10px] text-slate-600 space-y-1.5">
                                 {result.positives.map((p, i) => (
                                   <li key={i} className="leading-tight">• {p}</li>
                                 ))}
                               </ul>
                             </div>
                             <div className="bg-white/60 p-3 rounded-2xl border border-indigo-100/50 shadow-sm">
                               <h5 className="text-[10px] font-bold text-red-700 uppercase flex items-center gap-1 mb-2"><XCircle size={12}/> MELHORAR</h5>
                               <ul className="text-[10px] text-slate-600 space-y-1.5">
                                 {result.negatives.map((n, i) => (
                                   <li key={i} className="leading-tight">• {n}</li>
                                 ))}
                               </ul>
                             </div>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAnalyzeDay(date)} 
                          disabled={isAnalyzing} 
                          className={`w-full py-4 font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95
                            ${isAllowedPlan
                              ? 'bg-emerald-600 text-white border-none shadow-emerald-200 hover:bg-emerald-700' 
                              : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                          {isAnalyzing ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <>
                              {!isAllowedPlan && <Lock size={14} className="opacity-70" />}
                              <span>{t.diary.analyzeDay}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t.weeklyPlanner.savedPlans}</h2>
          </div>

          {savedPlans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500">{t.weeklyPlanner.emptySaved}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedPlans.map(plan => (
                <div key={plan.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div 
                    onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id || null)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{plan.title || 'Plano Guardado'}</h4>
                        <p className="text-xs text-slate-400">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id!); }}
                         className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                       >
                         <Trash2 size={18} />
                       </button>
                       <ChevronRightIcon className={`text-slate-300 transition-transform ${expandedPlanId === plan.id ? 'rotate-90' : ''}`} size={20} />
                    </div>
                  </div>

                  {expandedPlanId === plan.id && (
                    <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-6 animate-slide-up relative">
                      {!user.isPremium ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 overflow-hidden relative min-h-[300px]">
                          <div className="w-full space-y-4 opacity-30 blur-[4px] pointer-events-none select-none">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 h-16 w-full" />
                            <div className="h-6 w-32 bg-slate-200 rounded-lg" />
                            <div className="bg-white rounded-3xl border border-slate-100 h-32 w-full" />
                          </div>
                          
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col items-center text-center max-w-sm">
                              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <Lock size={28} />
                              </div>
                              <h3 className="font-bold text-slate-800 text-lg mb-2">Plano Bloqueado</h3>
                              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                                A análise detalhada e o plano semanal completo são exclusivos para membros Premium. Faz o upgrade agora para desbloquear o teu guia nutricional IA.
                              </p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onGoToPremium(); }}
                                className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
                              >
                                Ver Planos Premium
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                            "{plan.weekSummary}"
                          </div>
                          
                          {plan.days.map((day, dIdx) => (
                            <div key={dIdx} className="space-y-3">
                              <div className="flex items-center gap-2 px-1">
                                <CalendarIcon size={18} className="text-emerald-500" />
                                <h5 className="font-bold text-slate-800 capitalize">{day.day}</h5>
                              </div>
                              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
                                {day.meals.map((meal, mIdx) => (
                                  <div key={mIdx} className="p-4 flex justify-between items-center group">
                                    <div className="flex-1 min-w-0 pr-4">
                                      <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-0.5">
                                        {meal.type}
                                      </p>
                                      <p className="font-bold text-slate-700 text-sm leading-snug">
                                        {meal.name}
                                      </p>
                                    </div>
                                    <div className="shrink-0 bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono">
                                      {meal.calories} kcal
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
