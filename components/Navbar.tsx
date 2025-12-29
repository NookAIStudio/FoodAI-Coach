
import React from 'react';
import { AppView, Language } from '../types';
import { translations } from '../data/translations';
import { Camera, LayoutDashboard, Utensils, BookOpen, User, Settings } from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  language: Language;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView, language }) => {
  const t = translations[language] || translations['pt-PT'];
  
  // Robust label extraction to handle missing keys
  const navLabels = t?.nav || {
    home: 'Home',
    recipes: 'Recipes',
    analyze: 'Analyze',
    diary: 'Diary',
    profile: 'Profile'
  };
  
  const navItems = [
    { id: AppView.DASHBOARD, label: navLabels.home, icon: LayoutDashboard },
    { id: AppView.RECIPES, label: navLabels.recipes, icon: BookOpen },
    { id: AppView.CAMERA, label: navLabels.analyze, icon: Camera, highlight: true },
    { id: AppView.DIARY, label: navLabels.diary, icon: Utensils },
    { id: AppView.PROFILE, label: navLabels.profile, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe md:pb-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            if (item.highlight) {
               return (
                 <button
                   key={item.id}
                   onClick={() => onChangeView(item.id)}
                   className="relative -top-6"
                 >
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all
                     ${isActive ? 'bg-emerald-700 scale-110' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                     <Icon size={24} className="text-white" />
                   </div>
                 </button>
               )
            }

            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors
                  ${isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
