import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              Flavor<span className="text-primary">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Home
            </Link>
            <Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Explore
            </Link>
            <Link to="/my-recipes" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              My Recipes
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 border-b border-border mb-1">
                    <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="gradient" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link to="/" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors">Home</Link>
              <Link to="/explore" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors">Explore</Link>
              <Link to="/my-recipes" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors">My Recipes</Link>
              {user ? (
                <button onClick={signOut} className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-left flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              ) : (
                <Link to="/auth" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-center">Sign In</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
