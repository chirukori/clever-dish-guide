import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeModal } from '@/components/RecipeModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  ingredients?: any;
  steps?: any;
  tags?: string[];
  is_ai_generated?: boolean;
}

export default function MyRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyRecipes();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecipes(data as unknown as Recipe[]);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Sign in to view your recipes
              </h1>
              <p className="text-muted-foreground mb-8">
                Create an account to save and manage your favorite recipes
              </p>
              <Link to="/auth">
                <Button variant="gradient" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-2">
                My Recipes
              </h1>
              <p className="text-muted-foreground">
                Your saved and created recipes
              </p>
            </div>
            <Link to="/">
              <Button variant="gradient" className="gap-2">
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-6">
                You haven't created any recipes yet
              </p>
              <Link to="/">
                <Button variant="gradient">Create Your First Recipe</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}
