import { X, Clock, Users, ChefHat, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Ingredient, Recipe } from '@/utils/recipeUtils';

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

const difficultyColors = {
  easy: 'bg-secondary text-secondary-foreground',
  medium: 'bg-primary/10 text-primary',
  hard: 'bg-accent/10 text-accent',
};

export function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  if (!recipe) return null;

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {recipe.is_ai_generated && (
              <Badge className="bg-primary text-primary-foreground gap-1">
                <Sparkles className="h-3 w-3" />
                AI Generated
              </Badge>
            )}
            {recipe.difficulty && (
              <Badge className={difficultyColors[recipe.difficulty]}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="p-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">{recipe.title}</h2>

            {recipe.description && (
              <p className="text-muted-foreground mb-4">{recipe.description}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              {recipe.prep_time && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Prep: {recipe.prep_time} min</span>
                </div>
              )}
              {recipe.cook_time && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <ChefHat className="h-4 w-4 text-primary" />
                  <span>Cook: {recipe.cook_time} min</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
            </div>

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">1</span>
                  </span>
                  Ingredients
                </h3>
                <ul className="grid gap-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-transparent" />
                      </span>
                      <span>
                        <strong className="text-foreground">{ingredient.amount}</strong>
                        <span className="text-muted-foreground"> {ingredient.item}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            {recipe.steps && recipe.steps.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">2</span>
                  </span>
                  Instructions
                </h3>
                <ol className="space-y-4">
                  {recipe.steps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold text-sm">
                        {step.step || index + 1}
                      </span>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground">{step.instruction}</p>
                        {step.tip && (
                          <p className="mt-2 text-sm text-primary bg-primary/5 p-2 rounded-lg border border-primary/10">
                            💡 Tip: {step.tip}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
