
import { UserProfile } from "../types";

const DB_KEY = 'foodai_users_db';
const SESSION_KEY = 'foodai_session_user';

// Simple "encryption" for demo purposes (Base64)
// In a real app, never store passwords in local storage, use a backend.
const hashPassword = (pwd: string) => btoa(pwd);

export const authService = {
  getUsers: (): UserProfile[] => {
    const stored = localStorage.getItem(DB_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveUserToDb: (user: UserProfile) => {
    const users = authService.getUsers();
    // Check if updating existing or adding new
    const index = users.findIndex(u => u.email === user.email);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(users));
  },

  register: (userData: Partial<UserProfile>): { success: boolean; message?: string; user?: UserProfile } => {
    const users = authService.getUsers();
    
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'email_exists' };
    }

    const newUser: UserProfile = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      name: userData.name || '',
      email: userData.email || '',
      password: userData.password ? hashPassword(userData.password) : '',
      language: userData.language || 'pt-PT',
      age: userData.age || 0,
      // Defaults for fields filled later
      gender: 'male',
      height: 0,
      weight: 0,
      goal: 'lose_weight',
      activityLevel: 'moderate',
      dietaryRestrictions: [],
      targets: { calories: 2000, protein: 150, carbs: 200, fat: 60 },
      mealsPerDay: 4,
      isPremium: false,
      planType: 'free',
      profilePicture: userData.profilePicture
    };

    authService.saveUserToDb(newUser);
    // Auto login after register
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  login: (email: string, password: string): { success: boolean; user?: UserProfile } => {
    const users = authService.getUsers();
    const hashed = hashPassword(password);
    const user = users.find(u => u.email === email && u.password === hashed);

    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false };
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  updateCurrentUser: (updatedUser: UserProfile) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    authService.saveUserToDb(updatedUser);
  }
};