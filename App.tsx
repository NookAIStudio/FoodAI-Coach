
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FoodAnalyzer } from './components/FoodAnalyzer';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { Login } from './components/Login';
import { RecipeLibrary } from './components/RecipeLibrary';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { DailyPlanView } from './components/DailyPlan';
import { FoodDiary } from './components/FoodDiary';
import { Pricing } from './components/Pricing';
import { Profile } from './components/Profile';
import { LegalView } from './components/LegalView';
import { AppView, UserProfile, DiaryEntry, WeeklyPlan, Language } from './types';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [savedPlans, setSavedPlans] = useState<WeeklyPlan[]>([]);
  const [appLanguage, setAppLanguage] = useState<Language>('pt-PT');

  useEffect(() => {
    const sessionUser = authService.getCurrentUser();
    const savedDiary = localStorage.getItem('foodai_diary');
    const savedPlansData = localStorage.getItem('foodai_plans');
    
    if (sessionUser) {
      setUser(sessionUser);
      setAppLanguage(sessionUser.language);
      setCurrentView(AppView.DASHBOARD);
    } else {
      setCurrentView(AppView.ONBOARDING);
    }

    if (savedDiary) {
      setDiary(JSON.parse(savedDiary));
    }
    if (savedPlansData) {
      setSavedPlans(JSON.parse(savedPlansData));
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    setAppLanguage(profile.language);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLoginSuccess = () => {
    const loggedUser = authService.getCurrentUser();
    if (loggedUser) {
      setUser(loggedUser);
      setAppLanguage(loggedUser.language);
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setAppLanguage(updatedUser.language);
    authService.updateCurrentUser(updatedUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView(AppView.LOGIN);
  };

  const handleAddDiaryEntry = (entry: DiaryEntry) => {
    const newDiary = [entry, ...diary];
    setDiary(newDiary);
    localStorage.setItem('foodai_diary', JSON.stringify(newDiary));
    setCurrentView(AppView.DASHBOARD);
  };

  const handleDeleteDiaryEntry = (id: string) => {
    const newDiary = diary.filter(entry => entry.id !== id);
    setDiary(newDiary);
    localStorage.setItem('foodai_diary', JSON.stringify(newDiary));
  };

  const handleSavePlan = (plan: WeeklyPlan) => {
    const limit = user?.isPremium ? 4 : 1;
    if (savedPlans.length >= limit) return;
    const newPlans = [plan, ...savedPlans];
    setSavedPlans(newPlans);
    localStorage.setItem('foodai_plans', JSON.stringify(newPlans));
  };

  const handleDeletePlan = (id: string) => {
    const newPlans = savedPlans.filter(p => p.id !== id);
    setSavedPlans(newPlans);
    localStorage.setItem('foodai_plans', JSON.stringify(newPlans));
  };

  const handleRenamePlan = (id: string, newTitle: string) => {
    const newPlans = savedPlans.map(p => p.id === id ? { ...p, title: newTitle } : p);
    setSavedPlans(newPlans);
    localStorage.setItem('foodai_plans', JSON.stringify(newPlans));
  };

  const renderView = () => {
    if (currentView === AppView.ONBOARDING) {
      return (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          onGoToLogin={() => setCurrentView(AppView.LOGIN)} 
          language={appLanguage}
          onLanguageChange={setAppLanguage}
        />
      );
    }
    if (currentView === AppView.LOGIN) {
      return (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onGoToRegister={() => setCurrentView(AppView.ONBOARDING)} 
          language={appLanguage}
          onLanguageChange={setAppLanguage}
        />
      );
    }

    if (!user) {
      return (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onGoToRegister={() => setCurrentView(AppView.ONBOARDING)} 
          language={appLanguage}
          onLanguageChange={setAppLanguage}
        />
      );
    }

    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard user={user} diary={diary} onChangeView={setCurrentView} />;
      case AppView.CAMERA:
        return (
          <FoodAnalyzer 
            onSave={handleAddDiaryEntry} 
            onCancel={() => setCurrentView(AppView.DASHBOARD)} 
            language={user.language} 
            isPremium={user.isPremium}
            onGoToPremium={() => setCurrentView(AppView.PREMIUM)}
          />
        );
      case AppView.RECIPES:
        return (
          <RecipeLibrary 
            language={user.language} 
            user={user} 
            diary={diary}
            onGoToPremium={() => setCurrentView(AppView.PREMIUM)} 
          />
        );
      case AppView.WEEKLY_PLAN:
        return (
          <WeeklyPlanner 
            user={user} 
            onSavePlan={handleSavePlan} 
            savedPlansCount={savedPlans.length}
            onGoToPremium={() => setCurrentView(AppView.PREMIUM)} 
          />
        );
      case AppView.DIARY:
        return (
          <FoodDiary 
            diary={diary} 
            user={user} 
            onDelete={handleDeleteDiaryEntry}
            savedPlans={savedPlans}
            onDeletePlan={handleDeletePlan}
            onRenamePlan={handleRenamePlan}
            onGoToPremium={() => setCurrentView(AppView.PREMIUM)}
          />
        );
      case AppView.PREMIUM:
        return (
          <Pricing 
            language={user.language} 
            currentPlan={user.planType}
            onUpgrade={(plan) => {
              handleUpdateUser({ ...user, isPremium: true, planType: plan });
              setCurrentView(AppView.DASHBOARD);
            }} 
          />
        );
      case AppView.PROFILE:
        return <Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} onChangeView={setCurrentView} />;
      case AppView.LEGAL:
        return <LegalView language={user.language} onBack={() => setCurrentView(AppView.PROFILE)} />;
      default:
        return <Dashboard user={user} diary={diary} onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <main className="container mx-auto pt-6 md:pt-10 px-4 min-h-screen max-w-2xl relative">
        {renderView()}
      </main>
      
      {user && currentView !== AppView.ONBOARDING && currentView !== AppView.LOGIN && currentView !== AppView.CAMERA && currentView !== AppView.LEGAL && (
        <Navbar currentView={currentView} onChangeView={setCurrentView} language={user.language} />
      )}
    </div>
  );
};

export default App;
