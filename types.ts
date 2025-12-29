
export enum AppView {
  LOGIN = 'LOGIN',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  CAMERA = 'CAMERA',
  RECIPES = 'RECIPES',
  WEEKLY_PLAN = 'WEEKLY_PLAN',
  DIARY = 'DIARY',
  PREMIUM = 'PREMIUM',
  PROFILE = 'PROFILE',
  RECIPE_DETAILS = 'RECIPE_DETAILS',
  LEGAL = 'LEGAL'
}

export type Language = 'pt-PT' | 'pt-BR' | 'en' | 'es' | 'fr';

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodAnalysisResult {
  foodName: string;
  macros: MacroNutrients;
  healthScore: number; // 1-10
  feedback: string; 
  suggestions: string[]; // Improvement suggestions
  ingredients: string[];
  isValidFood?: boolean; // Flag to indicate if image quality is sufficient
}

export interface DailyAnalysisResult {
  score: number; // 1-10
  summary: string;
  positives: string[];
  negatives: string[]; // Critical analysis
  recommendations: string[]; // For tomorrow
}

export interface UserProfile {
  id?: string;
  createdAt?: number;
  name: string;
  email?: string;
  password?: string;
  language: Language;
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number; // cm
  weight: number; // kg
  goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'recomp';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  dietaryRestrictions: string[];
  targets: MacroNutrients;
  mealsPerDay: number;
  isPremium: boolean;
  planType?: 'free' | 'intermediate' | 'premium' | 'annual';
  profilePicture?: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: string; // Changed to string to support translated categories
  time: string;
  calories: number;
  macros: { p: number, c: number, f: number };
  ingredients: string[];
  steps: string[];
  isPremium: boolean;
}

export interface DiaryEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
  foodName: string;
  mealType: string;
  macros: MacroNutrients;
  image?: string;
}

export interface WeeklyPlan {
  id?: string;
  title?: string;
  createdAt?: number;
  weekSummary: string;
  days: {
    day: string;
    meals: {
      type: string;
      name: string;
      calories: number;
    }[];
  }[];
}

export interface DailyPlan {
  summary: string;
  meals: {
    type: string;
    name: string;
    calories: number;
    description: string;
  }[];
  workout: {
    name: string;
    intensity: string;
    duration: string;
    description: string;
  }[];
}
