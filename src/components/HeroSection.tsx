import { useState } from 'react';
import { Search, Sparkles, ChefHat, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import heroImage from '@/assets/hero-food.jpg';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const quickSearches = [
    "Quick pasta dinner",
    "Healthy breakfast",
    "Vegetarian curry",
    "Chocolate dessert"
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Fresh ingredients"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Recipe Discovery</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Cook Something
            <span className="block text-gradient">Delicious Today</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto animate-fade-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            Discover new recipes, get AI-generated cooking instructions, and share your culinary creations with the world.
          </p>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8 animate-fade-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What do you want to cook? Try 'spicy chicken tacos' or 'quick pasta'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base rounded-xl border-2 border-border focus:border-primary bg-card/80 backdrop-blur-sm"
                />
              </div>
              <Button type="submit" variant="hero" size="xl" disabled={isLoading} className="shrink-0">
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 animate-fade-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            <span className="text-sm text-muted-foreground">Try:</span>
            {quickSearches.map((search) => (
              <button
                key={search}
                onClick={() => {
                  setSearchQuery(search);
                  onSearch(search);
                }}
                className="px-3 py-1 text-sm rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {search}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-12 animate-fade-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold font-display">1000+</div>
              <div className="text-xs text-muted-foreground">Recipes</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold font-display">AI</div>
              <div className="text-xs text-muted-foreground">Powered</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold font-display">Fast</div>
              <div className="text-xs text-muted-foreground">& Easy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
