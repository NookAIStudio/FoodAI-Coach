
import React, { useState, useEffect } from 'react';
import { UserProfile, DiaryEntry, AppView } from '../types';
import { translations } from '../data/translations';
import { Camera, TrendingUp, PlusCircle, Zap, Flame, Droplets, ArrowRight, Apple, Lock } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  user: UserProfile;
  diary: DiaryEntry[];
  onChangeView: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, diary, onChangeView }) => {
  const t = translations[user.language] || translations['pt-PT'] || (Object.values(translations)[0]);
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = diary.filter(d => d.date === today);
  
  const [streak, setStreak] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);

  const consumed = todayEntries.reduce((acc, curr) => ({
    calories: acc.calories + curr.macros.calories,
    protein: acc.protein + curr.macros.protein,
    carbs: acc.carbs + curr.macros.carbs,
    fat: acc.fat + curr.macros.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const remaining = Math.max(0, user.targets.calories - consumed.calories);
  
  const chartData = [
    { name: 'Consumed', value: consumed.calories, color: '#10b981' },
    { name: 'Remaining', value: remaining, color: '#f1f5f9' },
  ];

  if (!t) return null;

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-900">
      {/* Header with Streak */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg text-white shrink-0">
            <Apple size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t.dashboard?.greeting || 'Hello'}, {user.name.split(' ')[0]}!</h1>
            <p className="text-slate-500 text-sm">{t.dashboard?.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm border border-orange-100">
             <Flame size={16} fill="currentColor" />
             <span className="font-bold text-sm">{streak} {t.dashboard?.days || 'days'}</span>
           </div>
        </div>
      </div>

      {/* Premium Upsell Banner */}
      {!user.isPremium && (
        <button 
          onClick={() => onChangeView(AppView.PREMIUM)}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between group overflow-hidden relative"
        >
          <div className="relative z-10 flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Zap size={20} className="text-yellow-300" fill="currentColor" />
             </div>
             <div className="text-left">
               <p className="text-sm font-bold">{t.dashboard?.premiumBanner}</p>
               <span className="text-[10px] text-emerald-50 opacity-90">{t.dashboard?.upgradeNow || 'Upgrade Now'} &rarr;</span>
             </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 transform translate-x-4 group-hover:translate-x-2 transition-transform" />
        </button>
      )}

      {/* Main Calorie Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <PieChart width={128} height={128}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={45}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                label={false}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-800">{remaining}</span>
              <span className="text-[8px] text-slate-400 uppercase font-bold">{t.dashboard?.remaining || 'Remaining'}</span>
            </div>
          </div>

          <div className="flex-1 pl-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-500 uppercase tracking-tight">{t.dashboard?.protein || 'Protein'}</span>
                <span className="text-slate-400 font-bold">{consumed.protein}/{user.targets.protein}g</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (consumed.protein/user.targets.protein)*100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-500 uppercase tracking-tight">{t.dashboard?.carbs || 'Carbs'}</span>
                <span className="text-slate-400 font-bold">{consumed.carbs}/{user.targets.carbs}g</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (consumed.carbs/user.targets.carbs)*100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-500 uppercase tracking-tight">{t.dashboard?.fat || 'Fat'}</span>
                <span className="text-slate-400 font-bold">{consumed.fat}/{user.targets.fat}g</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (consumed.fat/user.targets.fat)*100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Water Tracker */}
      <div className="bg-blue-50 rounded-2xl p-5 flex items-center justify-between border border-blue-100">
         <div className="flex items-center gap-3">
           <div className="bg-blue-100 p-2 rounded-full text-blue-600">
             <Droplets size={24} />
           </div>
           <div>
             <h3 className="font-bold text-slate-800 text-sm">{t.dashboard?.waterTracker || 'Hydration'}</h3>
             <p className="text-xs text-slate-500 font-medium">{waterGlasses} / 8 {t.dashboard?.glasses || 'glasses'}</p>
           </div>
         </div>
         <div className="flex items-center gap-2">
           <button 
             onClick={() => setWaterGlasses(prev => Math.min(8, prev + 1))}
             className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-md active:scale-95"
           >
             <PlusCircle size={20} />
           </button>
         </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onChangeView(AppView.CAMERA)}
          className="bg-emerald-600 text-white p-5 rounded-2xl shadow-lg shadow-emerald-200 flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Camera size={32} />
          <span className="font-bold text-sm uppercase tracking-wide">{t.nav?.analyze || 'Analyze'}</span>
        </button>
        <button 
          onClick={() => onChangeView(AppView.WEEKLY_PLAN)}
          className="bg-white text-emerald-600 border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <Zap size={32} fill="currentColor" className="text-emerald-500" />
          <span className="font-bold text-sm uppercase tracking-wide">{t.dashboard?.aiPlan || 'AI Plan'}</span>
        </button>
      </div>

      {/* Recent Meals */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-slate-900">{t.dashboard?.consumed || 'Consumed'}</h3>
          <button onClick={() => onChangeView(AppView.DIARY)} className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-1">
            {t.nav?.diary || 'Diary'} <ArrowRight size={14} />
          </button>
        </div>
        {todayEntries.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-inner">
            <p className="text-slate-400 text-sm font-medium">{t.dashboard?.noMeals || 'Nothing yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
             {todayEntries.map(entry => (
               <div key={entry.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
                 <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-50">
                   {entry.image ? <img src={entry.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="font-bold text-slate-800 text-sm truncate">{entry.foodName}</h4>
                   <p className="text-xs text-slate-400 font-medium">{entry.mealType} • {entry.macros.calories} kcal</p>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
