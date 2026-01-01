import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResult, WeeklyPlan, UserProfile, DailyPlan, Language, DiaryEntry, DailyAnalysisResult } from "../types";

const getLangContext = (lang: Language) => {
  switch(lang) {
    case 'pt-PT': return "European Portuguese (Portugal)";
    case 'pt-BR': return "Brazilian Portuguese (Brazil)";
    case 'en': return "English";
    case 'es': return "Spanish (Español)";
    case 'fr': return "French (Français)";
    default: return "Portuguese";
  }
};

export const analyzeFoodImage = async (base64Image: string, language: Language, userNote?: string): Promise<FoodAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
    const langContext = getLangContext(language);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: "image/jpeg",
            },
          },
          {
            text: `You are a friendly nutrition coach. You MUST respond exclusively in ${langContext}. 
            Translate every field of the JSON to ${langContext}.
            Analyze this meal. ${userNote ? `User note: ${userNote}` : ''}.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidFood: { type: Type.BOOLEAN },
            foodName: { type: Type.STRING },
            macros: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
              },
            },
            healthScore: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    if (!response.text) throw new Error("No response text");
    return JSON.parse(response.text) as FoodAnalysisResult;
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw error;
  }
};

export const analyzeFoodText = async (textDescription: string, language: Language): Promise<FoodAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langContext = getLangContext(language);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a friendly nutrition coach. You MUST respond exclusively in ${langContext}.
      Translate every field of the JSON output to ${langContext}.
      Analyze the following food description: "${textDescription}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidFood: { type: Type.BOOLEAN },
            foodName: { type: Type.STRING },
            macros: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
              },
            },
            healthScore: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    if (!response.text) throw new Error("No response text");
    return JSON.parse(response.text) as FoodAnalysisResult;
  } catch (error) {
    console.error("Error analyzing food text:", error);
    throw error;
  }
};

export const generateWeeklyPlanAI = async (
  profile: UserProfile, 
  preferences: { mealsPerDay: number, budget: string, pantry: string, pantryImages?: string[] }
): Promise<WeeklyPlan> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langContext = getLangContext(profile.language);
    const prompt = `You are a nutritionist. You MUST respond ONLY in ${langContext}. 
    Create a weekly meal plan (7 days) for the goal: ${profile.goal}.
    All text fields in the JSON response must be in ${langContext}.
    
    NUTRITIONAL TARGETS:
    - Calories: ${profile.targets.calories} kcal
    - Protein: ${profile.targets.protein}g
    - Carbs: ${profile.targets.carbs}g
    - Fat: ${profile.targets.fat}g
    
    User Info: ${profile.age} years, ${profile.weight}kg, restrictions: ${profile.dietaryRestrictions.join(', ') || 'None'}.
    Preferences: ${preferences.mealsPerDay} meals/day, Budget: ${preferences.budget}, Available in pantry: ${preferences.pantry}.
    ${preferences.pantryImages?.length ? 'IMPORTANT: Prioritize using ingredients identified in the provided pantry/fridge images.' : ''}`;

    const parts: any[] = [];
    if (preferences.pantryImages) {
        preferences.pantryImages.forEach(img => {
            const cleanBase64 = img.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
            parts.push({
                inlineData: {
                    data: cleanBase64,
                    mimeType: "image/jpeg",
                }
            })
        });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weekSummary: { type: Type.STRING, description: `A short summary in ${langContext}` },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: `Day name in ${langContext}` },
                  meals: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING, description: `Meal type name in ${langContext}` },
                        name: { type: Type.STRING, description: `Meal name in ${langContext}` },
                        calories: { type: Type.NUMBER },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!response.text) throw new Error("No response text");
    return JSON.parse(response.text) as WeeklyPlan;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const analyzeDailyIntake = async (user: UserProfile, entries: DiaryEntry[]): Promise<DailyAnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langContext = getLangContext(user.language);
    const prompt = `Act as a nutrition coach. You MUST respond exclusively in ${langContext}.
    Review the following food log for today and provide feedback in JSON.
    Entries: ${entries.map(e => `${e.mealType}: ${e.foodName} (${e.macros.calories}kcal)`).join(', ')}.
    Goals: ${user.goal}, Targets: ${user.targets.calories}kcal.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            positives: { type: Type.ARRAY, items: { type: Type.STRING } },
            negatives: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    if (!response.text) throw new Error("No response text");
    return JSON.parse(response.text) as DailyAnalysisResult;
  } catch (error) {
    console.error("Error analyzing daily intake:", error);
    throw error;
  }
};

export const generateDailyPlan = async (user: UserProfile): Promise<DailyPlan> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langContext = getLangContext(user.language);
    const prompt = `You are a professional nutrition and fitness coach. You MUST respond exclusively in ${langContext}.
    Create a detailed daily plan (meals and workout) based on the user profile below.
    Translate every field of the JSON output to ${langContext}.

    USER PROFILE:
    - Goal: ${user.goal}
    - Daily Targets: ${user.targets.calories} kcal, ${user.targets.protein}g protein, ${user.targets.carbs}g carbs, ${user.targets.fat}g fat
    - Age: ${user.age}, Weight: ${user.weight}kg, Height: ${user.height}cm
    - Restrictions: ${user.dietaryRestrictions.join(', ') || 'None'}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: `Brief summary of the day's focus in ${langContext}` },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: `Meal type (e.g., Breakfast, Lunch) in ${langContext}` },
                  name: { type: Type.STRING, description: `Meal name in ${langContext}` },
                  calories: { type: Type.NUMBER },
                  description: { type: Type.STRING, description: `Brief description of the meal in ${langContext}` },
                },
              },
            },
            workout: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: `Exercise name in ${langContext}` },
                  intensity: { type: Type.STRING, description: `Intensity level in ${langContext}` },
                  duration: { type: Type.STRING, description: `Duration (e.g., 10 min) in ${langContext}` },
                  description: { type: Type.STRING, description: `Short instruction/description in ${langContext}` },
                },
              },
            },
          },
        },
      },
    });

    if (!response.text) throw new Error("No response text");
    return JSON.parse(response.text) as DailyPlan;
  } catch (error) {
    console.error("Error generating daily plan:", error);
    throw error;
  }
};