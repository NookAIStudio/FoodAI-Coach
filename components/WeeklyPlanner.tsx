
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, WeeklyPlan } from '../types';
import { generateWeeklyPlanAI } from '../services/geminiService';
import { Sparkles, Calendar, Loader2, Camera, X, CheckCircle, Save, AlertCircle, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from '../data/translations';

interface WeeklyPlannerProps {
  user: UserProfile;
  onSavePlan: (plan: WeeklyPlan) => void;
  savedPlansCount: number;
  onGoToPremium: () => void;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ user, onSavePlan, savedPlansCount, onGoToPremium }) => {
  const t = translations[user.language] || translations['pt-PT'];
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [prefs, setPrefs] = useState({
    mealsPerDay: user.mealsPerDay || 3,
    budget: t.weeklyPlanner.budgetOptions[1],
    pantry: ''
  });
  const [pantryImages, setPantryImages] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pantry Scroll Logic
  const pantryScrollRef = useRef<HTMLDivElement>(null);
  const pantryTrackRef = useRef<HTMLDivElement>(null);
  const [pantryScrollProgress, setPantryScrollProgress] = useState(0);
  const [showPantryScroll, setShowPantryScroll] = useState(false);
  const [pantryThumbWidth, setPantryThumbWidth] = useState(30);
  const [isDraggingPantry, setIsDraggingPantry] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  const tips = t.weeklyPlanner.tips;
  const [currentTip, setCurrentTip] = useState(0);

  // Determine photo limit based on plan
  const getPhotoLimit = () => {
    if (user.planType === 'intermediate') return 15;
    if (user.planType === 'premium' || user.planType === 'annual') return 50;
    return 0; // Free plan has 0 limit
  };

  const photoLimit = getPhotoLimit();
  const hasAccessToSummary = user.planType && user.planType !== 'free';

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % tips.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading, tips.length]);

  useEffect(() => {
    const check = () => {
      if (pantryScrollRef.current) {
        const { scrollWidth, clientWidth } = pantryScrollRef.current;
        const needsScroll = scrollWidth > clientWidth;
        setShowPantryScroll(needsScroll);
        if (needsScroll) {
            setPantryThumbWidth(Math.max((clientWidth / scrollWidth) * 100, 20));
        }
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [pantryImages, step]);

  const handlePantryScroll = () => {
    if (pantryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = pantryScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setPantryScrollProgress(progress);
    }
  };

  const handlePantryTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pantryTrackRef.current && pantryScrollRef.current) {
      const rect = pantryTrackRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const { scrollWidth, clientWidth } = pantryScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      const trackWidth = rect.width;
      const thumbWidthPx = (pantryThumbWidth / 100) * trackWidth;
      const relativeClickX = clickX - (thumbWidthPx / 2);
      const percentage = Math.max(0, Math.min(1, relativeClickX / (trackWidth - thumbWidthPx)));
      
      pantryScrollRef.current.scrollTo({ left: percentage * maxScroll, behavior: 'smooth' });
    }
  };

  const handlePantryThumbPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (pantryScrollRef.current) {
      setIsDraggingPantry(true);
      dragStartX.current = e.clientX;
      dragStartScrollLeft.current = pantryScrollRef.current.scrollLeft;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePantryThumbPointerMove = (e: React.PointerEvent) => {
    if (isDraggingPantry && pantryScrollRef.current && pantryTrackRef.current) {
      const deltaX = e.clientX - dragStartX.current;
      const trackWidth = pantryTrackRef.current.clientWidth;
      const { scrollWidth, clientWidth } = pantryScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      const thumbWidthPx = (pantryThumbWidth / 100) * trackWidth;
      const availableTrackSpace = trackWidth - thumbWidthPx;
      const scrollPerPixel = maxScroll / availableTrackSpace;
      
      const newScrollLeft = dragStartScrollLeft.current + (deltaX * scrollPerPixel);
      pantryScrollRef.current.scrollLeft = newScrollLeft;
    }
  };

  const handlePantryThumbPointerUp = (e: React.PointerEvent) => {
    setIsDraggingPantry(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const scrollPantryBy = (amount: number) => {
    if (pantryScrollRef.current) {
      pantryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleGenerate = async () => {
    if (!user.isPremium && savedPlansCount >= 1) {
      onGoToPremium();
      return;
    }

    setLoading(true);
    setError(null);
    setIsSaved(false);
    try {
      const result = await generateWeeklyPlanAI(user, { ...prefs, pantryImages: user.isPremium ? pantryImages : [] });
      setPlan(result);
      setStep(2);
    } catch (e) {
      console.error(e);
      setError("Erro ao gerar o plano. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPantryImages(prev => {
            if (prev.length >= photoLimit) return prev;
            return [...prev, reader.result as string].slice(0, photoLimit);
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setPantryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const limit = user.isPremium ? 4 : 1;
    if (plan && !isSaved && savedPlansCount < limit) {
        const dateStr = new Date().toLocaleDateString(user.language);
        const planToSave = {
            ...plan,
            id: Date.now().toString(),
            title: `Plano ${dateStr}`,
            createdAt: Date.now()
        };
        onSavePlan(planToSave);
        setIsSaved(true);
    } else if (!user.isPremium && savedPlansCount >= 1) {
        onGoToPremium();
    }
  };

  const isLockedByPlan = photoLimit === 0;
  const isLimitReached = pantryImages.length >= photoLimit;

  if (step === 1) {
    return (
      <div className="max-w-xl mx-auto pb-20 animate-fade-in text-slate-900">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-emerald-100 rounded-full text-emerald-600 mb-4 shadow-sm">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{t.weeklyPlanner.title}</h2>
          <p className="text-slate-600 mt-2 text-sm">{t.weeklyPlanner.subtitle}</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-8">
          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-2 animate-fade-in">
              <AlertCircle size={20} className="shrink-0" />
              <span className="font-bold text-xs">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-[0.15em] mb-4 ml-1">{t.weeklyPlanner.questionMeals}</label>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setPrefs({...prefs, mealsPerDay: num})}
                  className={`flex-1 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all
                    ${prefs.mealsPerDay === num 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-500 shadow-sm' 
                      : 'border-slate-100 text-slate-500 bg-white hover:bg-slate-50 hover:border-slate-100'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-[0.15em] mb-4 ml-1">{t.weeklyPlanner.questionBudget}</label>
            <div className="grid grid-cols-3 gap-3">
              {t.weeklyPlanner.budgetOptions.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => setPrefs({...prefs, budget: opt})}
                  className={`py-3.5 rounded-2xl border-2 text-xs font-bold transition-all
                    ${prefs.budget === opt 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm' 
                      : 'border-slate-100 text-slate-500 bg-white hover:bg-slate-50 hover:border-slate-100'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <textarea 
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-slate-500 text-sm min-h-[140px] shadow-inner"
              placeholder={t.weeklyPlanner.pantryPlaceholder}
              rows={3}
              value={prefs.pantry}
              onChange={e => setPrefs({...prefs, pantry: e.target.value})}
            />
            
            <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="relative">
                <div 
                  ref={pantryScrollRef}
                  onScroll={handlePantryScroll}
                  className="flex gap-4 overflow-x-auto pb-6 pt-4 items-center scrollbar-hide snap-x"
                >
                  <button 
                    onClick={() => {
                      if (isLockedByPlan) {
                        onGoToPremium();
                      } else if (!isLimitReached) {
                        fileInputRef.current?.click();
                      }
                      // If limit reached, do nothing as requested.
                    }}
                    className={`w-20 h-20 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-slate-50 transition-all shrink-0 bg-white shadow-sm relative group overflow-hidden snap-start ${isLockedByPlan ? 'cursor-pointer' : (isLimitReached ? 'cursor-default opacity-50 bg-slate-100' : 'cursor-pointer')}`}
                  >
                    {isLockedByPlan && (
                      <div className="absolute inset-0 bg-slate-100/60 flex items-center justify-center backdrop-blur-[1px] z-10">
                        <Lock size={16} className="text-slate-500" />
                      </div>
                    )}
                    {isLimitReached && !isLockedByPlan && (
                      <div className="absolute inset-0 bg-slate-200/40 flex items-center justify-center z-10">
                        <Lock size={16} className="text-slate-400" />
                      </div>
                    )}
                    <Camera size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{t.common.photo}</span>
                  </button>
                  {pantryImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 shrink-0 animate-scale-in snap-start">
                      <img src={img} className="w-full h-full object-cover rounded-2xl border border-slate-100 shadow-sm" />
                      <button 
                        onClick={() => removeImage(idx)} 
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors z-20 border-2 border-white flex items-center justify-center"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>

                {showPantryScroll && (
                  <div className="flex items-center justify-center gap-3 px-2 py-1 animate-fade-in select-none">
                    <div 
                      ref={pantryTrackRef}
                      onClick={handlePantryTrackClick}
                      className="flex-1 max-w-[200px] h-[4px] bg-slate-200 rounded-full relative cursor-pointer"
                    >
                      <div 
                        onPointerDown={handlePantryThumbPointerDown}
                        onPointerMove={handlePantryThumbPointerMove}
                        onPointerUp={handlePantryThumbPointerUp}
                        className={`absolute h-[4px] bg-slate-400 rounded-full transition-colors duration-100 ease-out cursor-grab active:cursor-grabbing ${isDraggingPantry ? 'bg-slate-600' : ''}`}
                        style={{ 
                          width: `${pantryThumbWidth}%`,
                          left: `${(pantryScrollProgress / 100) * (100 - pantryThumbWidth)}%`,
                          touchAction: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-bold shadow-xl shadow-emerald-500/10 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} fill="currentColor" />}
            <span className="uppercase tracking-widest text-sm">{loading ? t.weeklyPlanner.buttonLoading : t.weeklyPlanner.buttonGenerate}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-24 animate-fade-in text-slate-900">
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-2xl font-bold">{t.weeklyPlanner.resultTitle}</h2>
        <button 
          onClick={() => setStep(1)} 
          className="bg-white px-4 py-2 rounded-full text-emerald-600 font-bold text-[10px] uppercase tracking-wider border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors"
        >
          {t.weeklyPlanner.newPlan}
        </button>
      </div>

      {plan && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 space-y-6">
            {hasAccessToSummary ? (
              <div className="bg-emerald-600 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden group border border-emerald-500">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                  <Sparkles size={80} />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-[0.2em] mb-2 opacity-80">{t.weeklyPlanner.summary}</h3>
                <p className="leading-relaxed font-medium">"{plan.weekSummary}"</p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                <div className="bg-amber-100 text-amber-600 p-3 rounded-full shadow-inner">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800 mb-1">{t.weeklyPlanner.summary}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Disponível a partir do plano Intermediário</p>
                </div>
                <button 
                  onClick={onGoToPremium}
                  className="text-[10px] font-bold text-emerald-600 uppercase underline"
                >
                  Upgrade agora
                </button>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`w-full py-4 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 border
                  ${isSaved 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-100 shadow-none' 
                      : 'bg-white text-emerald-600 border-emerald-500 hover:bg-emerald-50 shadow-emerald-500/10'}`}
            >
               {isSaved ? (
                   <><CheckCircle size={20}/> {t.weeklyPlanner.planSaved}</>
               ) : (
                   <><Save size={20}/> {t.weeklyPlanner.savePlan}</>
               )}
            </button>
          </div>

          <div className="space-y-6">
            {plan.days.map((day, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="bg-slate-50/80 p-4 border-b border-slate-50 font-bold text-slate-700 flex items-center gap-3">
                  <Calendar size={18} className="text-emerald-500" />
                  <span className="capitalize">{day.day}</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {day.meals.map((meal, mIdx) => (
                    <div key={mIdx} className="p-5 flex justify-between items-center hover:bg-slate-50/30 transition-colors group">
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 block">
                          {meal.type}
                        </span>
                        <p className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors leading-snug">
                          {meal.name}
                        </p>
                      </div>
                      <div className="shrink-0 bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono border border-slate-100">
                        {meal.calories} kcal
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
