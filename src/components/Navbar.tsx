
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from './ui/button';
import { ModeToggle } from './ModeToggle';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Settings, 
  BarChart3, 
  Trophy,
  Users,
  Volume2,
  Smartphone,
  Menu,
  X,
  Home,
  Target,
  HelpCircle,
  Zap,
  Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const Navbar = () => {
  const { session, signOut } = useAuth();
  const { hasRole } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = hasRole('admin');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { href: '/collections', label: 'Collections', icon: BookOpen },
    { href: '/custom-learning', label: 'Custom Learning', icon: Target },
    { href: '/practice', label: 'Practice', icon: Target },
    { href: '/quiz', label: 'Quiz', icon: HelpCircle },
    { href: '/audio-practice', label: 'Audio', icon: Volume2 },
    { href: '/community-hub', label: 'Community', icon: Users },
    { href: '/blog', label: 'Blog', icon: Globe }
  ];

  const userMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/notebook', label: 'Notebook', icon: BookOpen },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  if (isAdmin) {
    userMenuItems.push({ href: '/admin', label: 'Admin', icon: Zap });
  }

  const MobileMenu = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="text-xl font-bold">
              Quran Vocab
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="border-t pt-4 mt-4">
            {session ? (
              <div className="space-y-2">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  navigate('/auth');
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center">
            <img 
              src="/lovable-uploads/b5c20cf5-bb83-4ad5-ac3d-308060e995d8.png" 
              alt="Quran Vocab"
              className="h-12"
            />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  location.pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {isMobile && (
          <div className="flex items-center">
            <MobileMenu />
            <Link to="/" className="ml-4 flex items-center">
              <img 
                src="/lovable-uploads/b5c20cf5-bb83-4ad5-ac3d-308060e995d8.png" 
                alt="Quran Vocab"
                className="h-10"
              />
            </Link>
          </div>
        )}
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other components can go here */}
          </div>
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {session.user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{session.user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')} size="sm">
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
