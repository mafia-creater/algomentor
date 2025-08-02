import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Code2, Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center">
        {/* Logo and Site Name */}
        <div className="mx-8 flex items-center">
          <Link href="/" className="group mr-8 flex items-center space-x-3 transition-all duration-300 hover:scale-105">
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-20 blur transition duration-300 group-hover:opacity-40"></div>
              <div className="relative rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
                <Code2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent">
                AlgoMentor
              </span>
              <span className="text-xs text-muted-foreground/70 font-medium">
                Master Algorithms
              </span>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-1 items-center space-x-1">
          <NavLink href="/dashboard" icon={<Sparkles className="h-4 w-4" />}>
            Dashboard
          </NavLink>
        </nav>

        {/* Authentication Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <SignedOut>
            <Button 
              asChild 
              variant="ghost" 
              className="relative overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30"
            >
              <Link href="/sign-in" className="relative z-10">
                Log In
              </Link>
            </Button>
            <Button 
              asChild 
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
            >
              <Link href="/sign-up" className="relative z-10">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 opacity-0 transition-opacity duration-300 hover:opacity-100"></span>
                <span className="relative flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Get Started</span>
                </span>
              </Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-20 blur transition duration-300 hover:opacity-40"></div>
              <div className="relative">
                <UserButton 
                  afterSignOutUrl="/"
                  userProfileUrl="/profile"
                  userProfileMode="navigation"
                  appearance={{
                    elements: {
                      avatarBox: "ring-2 ring-gradient-to-r ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-300"
                    }
                  }}
                />
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
      
      {/* Animated bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </header>
  );
}

// Custom NavLink component for consistent styling
function NavLink({ 
  href, 
  children, 
  icon 
}: { 
  href: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:text-foreground dark:hover:from-blue-950/20 dark:hover:to-purple-950/20"
    >
      {/* Hover background effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center space-x-2">
        {icon && (
          <span className="transition-colors duration-300 group-hover:text-blue-600">
            {icon}
          </span>
        )}
        <span>{children}</span>
      </div>
      
      {/* Bottom border animation */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></div>
    </Link>
  );
}