export interface Ingredient {
  item: string;
  amount: string;
}

export interface Step {
  step: number;
  instruction: string;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  ingredients?: Ingredient[];
  steps?: Step[];
  tags?: string[];
  is_ai_generated?: boolean;
}

export const normalizeIngredients = (data: any): Ingredient[] => {
  if (!data) return [];

  let ingredients = data;

  // Handle if data is a JSON string
  if (typeof data === 'string') {
    try {
      ingredients = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse ingredients:', e);
      return [];
    }
  }

  // Handle if it's not an array after parsing
  if (!Array.isArray(ingredients)) {
    // If it's an object with numbered keys (sometimes happens with bad JSON imports)
    if (typeof ingredients === 'object' && ingredients !== null) {
      return Object.values(ingredients).map((ing: any) => ({
        item: ing.item || ing.name || 'Unknown',
        amount: ing.amount || ing.quantity || ''
      }));
    }
    return [];
  }

  // Normalize each item in the array
  return ingredients.map((ing: any) => {
    // Already in correct format
    if (ing.item && ing.amount) {
      return {
        item: ing.item,
        amount: ing.amount
      };
    }
    
    // Handle simple string ingredients (e.g. ["Salt", "Pepper"])
    if (typeof ing === 'string') {
      return {
        item: ing,
        amount: ''
      };
    }

    // Handle potential variant keys
    return {
      item: ing.item || ing.name || ing.ingredient || 'Unknown Ingredient',
      amount: ing.amount || ing.quantity || ing.measure || ''
    };
  });
};
