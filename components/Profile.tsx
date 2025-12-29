
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Language, MacroNutrients, AppView } from '../types';
import { translations } from '../data/translations';
import { LogOut, Globe, Camera, X, Check, ZoomIn, Image as ImageIcon, Edit3, Target, Ruler, Crown, Utensils, ChevronDown, ShieldCheck } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onChangeView: (view: AppView) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateUser, onChangeView }) => {
  const t = translations[user.language] || translations['pt-PT'] || (Object.values(translations)[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [isEditingStats, setIsEditingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedStats, setEditedStats] = useState({
    weight: user.weight,
    height: user.height,
    age: user.age
  });

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editedGoal, setEditedGoal] = useState(user.goal);
  const [editedTargets, setEditedTargets] = useState(user.targets);
  const [editedMealsPerDay, setEditedMealsPerDay] = useState(user.mealsPerDay || 4);

  const calculateNewTargets = (weight: number, height: number, age: number, goalOverride?: string): MacroNutrients => {
    const gender = user.gender || 'male';
    const goal = goalOverride || user.goal || 'maintain';
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;
    let tdee = bmr * 1.375;
    if (goal === 'lose_weight') tdee -= 500;
    if (goal === 'gain_muscle') tdee += 300;
    const calories = Math.round(tdee);
    const protein = Math.round((calories * 0.3) / 4);
    const fat = Math.round((calories * 0.3) / 9);
    const carbs = Math.round((calories * 0.4) / 4);
    return { calories, protein, carbs, fat };
  };

  const handleLanguageChange = (lang: Language) => {
    onUpdateUser({ ...user, language: lang });
  };

  const handleGoalChange = (newGoal: any) => {
    setEditedGoal(newGoal);
    const newTargets = calculateNewTargets(user.weight, user.height, user.age, newGoal);
    setEditedTargets(newTargets);
  };

  const handleSaveGoals = () => {
    onUpdateUser({ 
      ...user, 
      goal: editedGoal,
      targets: editedTargets, 
      mealsPerDay: editedMealsPerDay 
    });
    setIsEditingGoals(false);
  };

  const handleSaveStats = () => {
    setError(null);
    const { weight, height, age } = editedStats;
    if (!weight || !height || !age || age < 13 || age > 115 || height < 50 || height > 250 || weight < 20 || weight > 300) {
        setError(t.errors?.fillAll || 'Invalid data');
        return;
    }
    const newTargets = calculateNewTargets(weight, height, age, editedGoal);
    const updatedUser = { ...user, weight, height, age, targets: newTargets };
    onUpdateUser(updatedUser);
    setEditedTargets(newTargets);
    setIsEditingStats(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSelectedFile(result);
        onUpdateUser({ ...user, profilePicture: result });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getPlanLabel = () => {
    if (user.planType === 'annual') return t.plans.annual;
    if (user.planType === 'premium') return t.plans.premium;
    if (user.planType === 'intermediate') return t.plans.intermediate;
    return t.plans.free;
  };

  if (!t) return null;

  return (
    <div className="pb-24 animate-fade-in space-y-6 text-slate-900">
      <div className="bg-emerald-600 pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-lg -mx-4 mb-8 text-white relative">
        <div className="flex items-center gap-4">
          <div 
            className="relative group cursor-pointer active:scale-95 transition-transform" 
            onClick={() => fileInputRef.current?.click()}
            title="Atualizar foto de perfil"
          >
            <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/10 overflow-hidden flex items-center justify-center relative shadow-lg">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold">{user.name.charAt(0)}</span>
              )}
              {/* Subtle click indicator hint */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Camera size={20} className="text-white/70" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate">{user.name}</h2>
            <p className="opacity-80 text-sm truncate">{user.email}</p>
            <button 
              onClick={() => onChangeView(AppView.PREMIUM)}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md border border-white/20 transition-all active:scale-95"
            >
              <Crown size={12} className={user.isPremium ? "text-yellow-400" : "text-slate-300"} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {getPlanLabel()}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 space-y-6 pb-12">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative">
          <button onClick={() => { setIsEditingStats(!isEditingStats); setError(null); }} className="absolute top-4 right-4 text-emerald-500 p-2 hover:bg-emerald-50 rounded-full">{isEditingStats ? <X size={20} /> : <Edit3 size={18} />}</button>
          {isEditingStats ? (
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2 text-sm uppercase"><Ruler size={18} className="text-emerald-500" />{t.biometrics?.title || 'Biometrics'}</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">{t.biometrics?.weight}</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 text-center" value={editedStats.weight} onChange={e => setEditedStats({...editedStats, weight: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">{t.biometrics?.height}</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 text-center" value={editedStats.height} onChange={e => setEditedStats({...editedStats, height: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">{t.biometrics?.age}</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 text-center" value={editedStats.age} onChange={e => setEditedStats({...editedStats, age: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              {error && <div className="text-red-500 text-[10px] font-bold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
              <button onClick={handleSaveStats} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg">{t.profile?.save || 'Save'}</button>
            </div>
          ) : (
            <div className="flex justify-around text-center pt-2">
              {[{l: t.biometrics?.weight, v: user.weight, u: 'kg'}, {l: t.biometrics?.height, v: user.height, u: 'cm'}, {l: t.biometrics?.age, v: user.age, u: 'anos'}].map((s, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center"><div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-tight">{s.l}</div><div className="text-2xl font-bold text-slate-800">{s.v} <span className="text-xs font-medium text-slate-400">{s.u}</span></div></div>
                  {i < 2 && <div className="w-px h-10 bg-slate-100 self-center"></div>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase"><Target size={18} className="text-emerald-500" />{t.profile?.goalsTitle || 'Goals'}</h3>
            <button onClick={() => setIsEditingGoals(!isEditingGoals)} className="text-xs text-emerald-500 font-bold uppercase tracking-widest">{isEditingGoals ? t.profile?.cancel : t.profile?.editGoals}</button>
          </div>
          <div className="p-6">
            {isEditingGoals ? (
              <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1 tracking-widest">Objetivo Principal</label>
                   <div className="grid grid-cols-2 gap-2">
                      {['lose_weight', 'gain_muscle', 'maintain', 'recomp'].map(g => (
                        <button 
                          key={g}
                          onClick={() => handleGoalChange(g)}
                          className={`p-3.5 rounded-2xl text-[10px] font-bold uppercase transition-all border
                            ${editedGoal === g 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' 
                              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                        >
                          {t.goals?.[g] || g}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['calories', 'protein', 'carbs', 'fat'].map(k => (
                    <div key={k} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1 tracking-widest">{t.profile?.macros?.[k] || k}</label>
                      <input type="number" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800" value={(editedTargets as any)[k]} onChange={e => setEditedTargets({...editedTargets, [k]: parseInt(e.target.value) || 0})} />
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-slate-50">
                   <label className="block text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 tracking-widest">{t.profile?.mealsPerDay}</label>
                   <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          onClick={() => setEditedMealsPerDay(num)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all border shrink-0 flex items-center justify-center
                            ${editedMealsPerDay === num 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                              : 'bg-white border-slate-100 text-slate-500'}`}
                        >
                          {num}
                        </button>
                      ))}
                   </div>
                </div>

                <button onClick={handleSaveGoals} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-xs">{t.profile?.saveGoals || 'Save'}</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {[{l: 'CAL', v: user.targets.calories, c: 'slate'}, {l: 'PROT', v: user.targets.protein, c: 'emerald'}, {l: 'CARB', v: user.targets.carbs, c: 'blue'}, {l: 'GORD', v: user.targets.fat, c: 'amber'}].map(m => (
                      <div key={m.l} className={`bg-${m.c === 'slate' ? 'slate-50' : m.c + '-50'} p-5 rounded-3xl flex flex-col items-center justify-center border border-slate-50 shadow-sm transition-all hover:scale-[1.02]`}>
                        <div className={`text-[10px] text-${m.c === 'slate' ? 'slate-400' : m.c + '-600'} font-bold uppercase mb-2 tracking-widest`}>{m.l}</div>
                        <div className={`text-xl font-bold text-${m.c === 'slate' ? 'slate-800' : m.c + '-700'}`}>{m.v}{m.l !== 'CAL' && <span className="text-[10px] ml-0.5">g</span>}</div>
                      </div>
                   ))}
                </div>
                
                <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-2xl text-emerald-500 shadow-sm border border-slate-50">
                        <Utensils size={18} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{t.profile?.mealsPerDay || 'Meals/Day'}</span>
                   </div>
                   <span className="text-xl font-bold text-slate-800">{user.mealsPerDay || 4}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-50"><h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase"><Globe size={18} className="text-blue-500" />{t.profile?.language || 'Language'}</h3></div>
          <div className="p-2 space-y-1">
            {[{id: 'pt-PT', l: 'Português (Portugal)', f: '🇵🇹'}, {id: 'pt-BR', l: 'Português (Brasil)', f: '🇧🇷'}, {id: 'en', l: 'English', f: '🇺🇸'}, {id: 'es', l: 'Español', f: '🇪🇸'}, {id: 'fr', l: 'Français', f: '🇫🇷'}].map((opt) => (
              <button key={opt.id} onClick={() => handleLanguageChange(opt.id as Language)} className={`w-full p-4 rounded-2xl text-left flex items-center justify-between transition-all ${user.language === opt.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}>
                <span className="flex items-center gap-3"><span className="text-xl">{opt.f}</span><span className="text-sm">{opt.l}</span></span>
                {user.language === opt.id && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onChangeView(AppView.LEGAL)}
          className="w-full p-5 bg-white text-slate-500 rounded-3xl font-bold flex items-center justify-center gap-2 border border-slate-100 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ShieldCheck size={20} className="text-slate-400" />
          {t.profile.legal}
        </button>

        <button onClick={onLogout} className="w-full p-5 bg-red-50 text-red-500 rounded-3xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors hover:bg-red-100"><LogOut size={20} />{t.profile?.logout || 'Logout'}</button>
      </div>
    </div>
  );
};
