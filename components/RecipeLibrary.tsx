
import React, { useState, useRef, useEffect } from 'react';
import { Recipe, Language, UserProfile, DiaryEntry } from '../types';
import { translations } from '../data/translations';
import { Clock, Flame, Lock, ChevronLeft, ChevronRight, ArrowLeft, ChefHat, List, ArrowDown } from 'lucide-react';

interface RecipeLibraryProps {
  language: Language;
  user: UserProfile;
  diary: DiaryEntry[];
  onGoToPremium: () => void;
}

export const RecipeLibrary: React.FC<RecipeLibraryProps> = ({ language, user, diary, onGoToPremium }) => {
  // Robust translation fetching
  const t = translations[language] || translations['pt-PT'] || Object.values(translations)[0];
  
  // Use IDs for filtering to be language-independent
  const [filterId, setFilterId] = useState('all'); 
  
  const INITIAL_COUNT = 6;
  const LOAD_MORE_COUNT = 4;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  
  const recipes = (t.recipeList as Recipe[]) || [];
  const categories = (t.categories as { id: string, label: string }[]) || [];
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(30);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  useEffect(() => {
    const checkScroll = () => {
      if (categoriesRef.current) {
        const { scrollWidth, clientWidth } = categoriesRef.current;
        const needsScroll = scrollWidth > clientWidth;
        setShowScrollIndicator(needsScroll);
        if (needsScroll) {
          const calculatedThumbWidth = (clientWidth / scrollWidth) * 100;
          setThumbWidth(Math.max(calculatedThumbWidth, 15)); 
        }
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = () => {
    if (categoriesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scrollTrackRef.current && categoriesRef.current) {
      const rect = scrollTrackRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const { scrollWidth, clientWidth } = categoriesRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      const trackWidth = rect.width;
      const thumbWidthPx = (thumbWidth / 100) * trackWidth;
      const relativeClickX = clickX - (thumbWidthPx / 2);
      const percentage = Math.max(0, Math.min(1, relativeClickX / (trackWidth - thumbWidthPx)));
      
      categoriesRef.current.scrollTo({ left: percentage * maxScroll, behavior: 'smooth' });
    }
  };

  const handleThumbPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (categoriesRef.current) {
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartScrollLeft.current = categoriesRef.current.scrollLeft;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleThumbPointerMove = (e: React.PointerEvent) => {
    if (isDragging && categoriesRef.current && scrollTrackRef.current) {
      const deltaX = e.clientX - dragStartX.current;
      const trackWidth = scrollTrackRef.current.clientWidth;
      const { scrollWidth, clientWidth } = categoriesRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      const thumbWidthPx = (thumbWidth / 100) * trackWidth;
      const availableTrackSpace = trackWidth - thumbWidthPx;
      const scrollPerPixel = maxScroll / availableTrackSpace;
      
      const newScrollLeft = dragStartScrollLeft.current + (deltaX * scrollPerPixel);
      categoriesRef.current.scrollLeft = newScrollLeft;
    }
  };

  const handleThumbPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const scrollBy = (amount: number) => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const filteredRecipes = filterId === 'all'
    ? recipes
    : recipes.filter(r => r.category === filterId);

  const displayedRecipes = filteredRecipes.slice(0, visibleCount);

  const handleFilterChange = (id: string) => {
    setFilterId(id);
    setVisibleCount(INITIAL_COUNT);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + LOAD_MORE_COUNT);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    // Access if free OR has any premium plan (intermediate/premium/annual)
    const hasAccess = !recipe.isPremium || (user.planType && user.planType !== 'free');
    if (!hasAccess) {
      onGoToPremium();
      return;
    }
    setSelectedRecipe(recipe);
  };

  // Helper to get localized category label for a given ID
  const getCategoryLabel = (id: string) => {
    return t.categoryLabels?.[id] || id;
  };

  if (selectedRecipe) {
    const rT = t.recipes || {};
    return (
      <div className="pb-20 animate-slide-up bg-white min-h-screen">
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-slate-100 flex items-center gap-3">
          <button 
            onClick={() => setSelectedRecipe(null)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 truncate flex-1">{selectedRecipe.title}</h2>
        </div>

        <div className="p-6 space-y-8">
          <div className="flex justify-center gap-8 py-4 bg-slate-50 rounded-2xl">
             <div className="text-center">
               <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                 <Clock size={16} />
               </div>
               <span className="font-bold text-slate-800">{selectedRecipe.time}</span>
             </div>
             <div className="w-px bg-slate-200"></div>
             <div className="text-center">
               <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                 <Flame size={16} />
               </div>
               <span className="font-bold text-slate-800">{selectedRecipe.calories} kcal</span>
             </div>
             <div className="w-px bg-slate-200"></div>
             <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase">Prot</span>
                </div>
                <span className="font-bold text-slate-800">{selectedRecipe.macros.p}g</span>
             </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-4">
              <List className="text-emerald-600" />
              {rT.ingredients}
            </h3>
            <ul className="space-y-3">
              {selectedRecipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-2 h-2 mt-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-slate-700">{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-4">
              <ChefHat className="text-emerald-600" />
              {rT.instructions}
            </h3>
            <div className="space-y-6">
              {selectedRecipe.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                     <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                       {i + 1}
                     </div>
                     {i !== selectedRecipe.steps.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1"></div>}
                  </div>
                  <p className="text-slate-600 leading-relaxed pb-4">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rT = t.recipes || {};

  return (
    <div className="pb-24 animate-fade-in space-y-6">
      <div className="px-1 text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-1">{rT.title}</h2>
        <p className="text-slate-500 text-sm">{rT.subtitle}</p>
      </div>

      <div className="relative space-y-5">
        <div 
          ref={categoriesRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-3 scrollbar-hide px-4 items-center justify-start md:justify-center"
        >
          {categories.map((cat: { id: string, label: string }) => (
            <button
              key={cat.id}
              onClick={() => handleFilterChange(cat.id)}
              className={`whitespace-nowrap px-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all
                ${filterId === cat.id 
                  ? 'bg-[#0f172a] text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-600 bg-white border border-slate-100'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {showScrollIndicator && (
          <div className="flex items-center justify-center gap-2 px-6 py-2 animate-fade-in">
            <button 
              onClick={() => scrollBy(-150)}
              className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={14} strokeWidth={3} />
            </button>
            <div 
              ref={scrollTrackRef}
              onClick={handleTrackClick}
              className="flex-1 max-w-[320px] h-[4px] bg-slate-100 rounded-full relative cursor-pointer group select-none"
            >
               <div 
                 onPointerDown={handleThumbPointerDown}
                 onPointerMove={handleThumbPointerMove}
                 onPointerUp={handleThumbPointerUp}
                 className={`absolute h-[8px] -top-[2px] bg-slate-400 rounded-full transition-colors duration-100 ease-out cursor-grab active:cursor-grabbing hover:bg-slate-500 ${isDragging ? 'bg-slate-600' : ''}`}
                 style={{ 
                   width: `${thumbWidth}%`,
                   left: `${(scrollProgress / 100) * (100 - thumbWidth)}%`,
                   touchAction: 'none'
                 }}
               />
            </div>
            <button 
              onClick={() => scrollBy(150)}
              className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 px-2">
        {filteredRecipes.slice(0, visibleCount).map(recipe => (
          <button 
            key={recipe.id} 
            onClick={() => handleRecipeClick(recipe)}
            className="w-full text-left bg-slate-50 rounded-[2.5rem] p-6 group hover:bg-slate-100 transition-all animate-fade-in"
          >
            <div className="mb-4">
                <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      {getCategoryLabel(recipe.category)}
                    </span>
                    {recipe.isPremium && (!user.planType || user.planType === 'free') && (
                        <div className="text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase">
                          <Lock size={11} /> {rT.premium}
                        </div>
                    )}
                </div>
            </div>

            <h3 className="font-bold text-slate-800 text-[19px] mb-4 leading-tight">{recipe.title}</h3>
            
            <div className="flex items-center text-[12px] text-slate-400 gap-6 font-bold">
                <span className="flex items-center gap-2"><Clock size={16} /> {recipe.time}</span>
                <span className="flex items-center gap-2"><Flame size={16} /> {recipe.calories} kcal</span>
            </div>
          </button>
        ))}
      </div>

      {visibleCount < filteredRecipes.length && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 text-slate-400 border border-slate-200 px-8 py-4 rounded-3xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm"
          >
            {rT.loadMore} <ArrowDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
