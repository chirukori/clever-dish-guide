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

export const normalizeSteps = (data: any): Step[] => {
  if (!data) return [];

  let steps = data;

  // Handle if data is a JSON string
  if (typeof data === 'string') {
    try {
      steps = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse steps:', e);
      return [];
    }
  }

  // Handle if it's not an array after parsing
  if (!Array.isArray(steps)) {
    // If it's an object with numbered keys
    if (typeof steps === 'object' && steps !== null) {
      return Object.values(steps).map((step: any, index) => ({
        step: step.step || index + 1,
        instruction: step.instruction || step.description || step.text || '',
        tip: step.tip || ''
      }));
    }
    return [];
  }

  // Normalize each item in the array
  return steps.map((step: any, index) => {
    // Handle simple string steps
    if (typeof step === 'string') {
      return {
        step: index + 1,
        instruction: step,
        tip: ''
      };
    }

    return {
      step: step.step || index + 1,
      instruction: step.instruction || step.description || step.text || '',
      tip: step.tip || ''
    };
  });
};
