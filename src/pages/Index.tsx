import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { RecipeModal } from '@/components/RecipeModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Recipe {
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  ingredients?: { item: string; amount: string }[];
  steps?: { step: number; instruction: string; tip?: string }[];
  tags?: string[];
  is_ai_generated?: boolean;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { query, type: 'generate' }
      });

      if (error) throw error;

      if (data?.result) {
        const recipe = {
          ...data.result,
          is_ai_generated: true
        };
        setGeneratedRecipe(recipe);
        toast.success('Recipe generated successfully!');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onSearch={handleSearch} isLoading={isLoading} />
      </main>
      <RecipeModal recipe={generatedRecipe} onClose={() => setGeneratedRecipe(null)} />
    </div>
  );
};

export default Index;
