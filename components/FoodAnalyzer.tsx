
import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, AlertCircle, CheckCircle, Activity, Lock, Sparkles, Type } from 'lucide-react';
import { analyzeFoodImage, analyzeFoodText } from '../services/geminiService';
import { FoodAnalysisResult, DiaryEntry, Language } from '../types';
import { translations } from '../data/translations';

interface FoodAnalyzerProps {
  onSave: (entry: DiaryEntry) => void;
  onCancel: () => void;
  language: Language;
  isPremium: boolean;
  onGoToPremium: () => void;
}

export const FoodAnalyzer: React.FC<FoodAnalyzerProps> = ({ onSave, onCancel, language, isPremium, onGoToPremium }) => {
  const t = translations[language] || translations['pt-PT'];
  const [image, setImage] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState<string>('Lunch');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mealTypeOptions = [
    { id: 'Breakfast', label: t.analyzer.mealTypes.breakfast },
    { id: 'Lunch', label: t.analyzer.mealTypes.lunch },
    { id: 'Dinner', label: t.analyzer.mealTypes.dinner },
    { id: 'Snack', label: t.analyzer.mealTypes.snack }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setManualText('');
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image && !manualText.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      let analysis;
      if (image) {
        analysis = await analyzeFoodImage(image, language);
      } else {
        analysis = await analyzeFoodText(manualText, language);
      }

      if (analysis.isValidFood === false && image) { 
        setError(analysis.feedback || t.analyzer.error); 
      } else { 
        setResult(analysis); 
      }
    } catch (err) { 
      setError(t.analyzer.error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({ 
      id: Date.now().toString(), 
      date: new Date().toISOString().split('T')[0], 
      timestamp: Date.now(), 
      foodName: result.foodName, 
      mealType: mealTypeOptions.find(m => m.id === mealType)?.label || mealType, 
      macros: result.macros, 
      image: image || undefined
    });
  };

  const formatScore = (score: number) => {
    const value = score > 10 ? score / 10 : score;
    return value.toLocaleString(language === 'en' ? 'en-US' : 'pt-PT', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in relative text-slate-900">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-800">{t.analyzer.title}</h2>
        <button onClick={onCancel} className="text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors">{t.back}</button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 space-y-6">
        <div className={`relative w-full h-72 rounded-3xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all ${image ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
          {image ? (
            <img src={image} className="w-full h-full object-contain" alt="Food" />
          ) : (
            <div className="text-center p-4">
              <div className="flex justify-center space-x-4 mb-2">
                <Camera className="text-slate-300" size={32} />
                <Upload className="text-slate-300" size={32} />
              </div>
              <p className="text-sm text-slate-400 font-medium">{t.analyzer.takePhoto}</p>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        {!image && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 px-1">
              <Type size={16} className="text-emerald-500" />
              <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">{t.analyzer.describeTitle}</label>
            </div>
            <textarea 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium min-h-[100px] resize-none shadow-inner"
              placeholder={t.analyzer.describePlaceholder}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
            />
          </div>
        )}
        
        {(image || manualText.trim()) && !result && (
          <button 
            onClick={handleAnalyze} 
            disabled={loading} 
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="animate-spin" /><span>{t.analyzer.analyzing}</span></>
            ) : (
              <><Activity size={18} /><span>{t.analyzer.analyzeBtn}</span></>
            )}
          </button>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center space-x-2 text-sm">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-6">
             <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <h3 className="text-2xl font-bold capitalize text-slate-900 leading-tight">{result.foodName}</h3>
                  <p className="text-emerald-600 font-bold text-sm mt-1">Score: {formatScore(result.healthScore)}/10</p>
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-bold text-slate-900">{result.macros.calories}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">kcal</span>
                </div>
             </div>
             
             {isPremium ? (
               <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-slate-600 border-l-4 border-emerald-500 italic text-sm leading-relaxed">
                 "{result.feedback}"
               </div>
             ) : (
               <button 
                 onClick={onGoToPremium}
                 className="mt-6 w-full p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between group"
               >
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <Lock size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Análise Detalhada</p>
                      <p className="text-[10px] text-indigo-600">Desbloqueia feedback do Coach AI</p>
                    </div>
                 </div>
                 <Sparkles size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
               </button>
             )}
          </div>
          
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'PROTEÍNA', value: result.macros.protein, color: 'emerald' },
                { label: 'CARBOS', value: result.macros.carbs, color: 'blue' },
                { label: 'GORDURA', value: result.macros.fat, color: 'amber' }
              ].map(macro => (
                <div key={macro.label} className={`p-4 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center shadow-sm`}>
                  <div className={`text-[10px] text-${macro.color}-600 font-bold mb-1 uppercase tracking-tighter`}>{macro.label}</div>
                  <div className={`text-xl font-bold text-slate-800`}>{macro.value}g</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-xl">
            <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest px-1">Adicionar ao Diário</h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {mealTypeOptions.map(opt => (
                <button 
                  key={opt.id} 
                  onClick={() => setMealType(opt.id)} 
                  className={`px-4 py-4 rounded-2xl text-sm font-bold transition-all border-2 flex items-center justify-center
                    ${mealType === opt.id 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button 
              onClick={handleSave} 
              className="w-full py-4 bg-emerald-500 text-white rounded-[1.5rem] font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle size={22} /> {t.analyzer.confirm}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
