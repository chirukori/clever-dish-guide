import { Clock, Users, ChefHat, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Recipe {
  id?: string;
  title: string;
  description?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  is_ai_generated?: boolean;
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

const difficultyColors = {
  easy: 'bg-secondary text-secondary-foreground',
  medium: 'bg-primary/10 text-primary',
  hard: 'bg-accent/10 text-accent',
};

const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <article
      onClick={onClick}
      className="group card-elevated rounded-2xl overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image_url || defaultImage}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {recipe.is_ai_generated && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 text-primary-foreground gap-1">
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          </div>
        )}

        {recipe.difficulty && (
          <div className="absolute top-3 right-3">
            <Badge className={difficultyColors[recipe.difficulty]}>
              {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>
        
        {recipe.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
