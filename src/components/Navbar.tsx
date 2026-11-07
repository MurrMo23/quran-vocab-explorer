
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from './ui/button';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Settings, 
  BarChart3, 
  Volume2,
  Menu,
  X,
  Home,
  Target,
  Zap,
  Globe,
  Library,
  NotebookPen,
  Sparkles,
  Moon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

// The site name shows until the configured logo has actually loaded, then the logo replaces it
// in one step (no empty box while it downloads, and no swap at all if it fails).
const Brand = ({ url, name, imgClass, height, textClass }: {
  url: string; name: string; imgClass: string; height: number; textClass: string;
}) => {
  const src = url?.trim();
  const [loadedSrc, setLoadedSrc] = useState('');
  const loaded = !!src && loadedSrc === src;
  return (
    <>
      {src ? (
        <img
          src={src}
          alt={name}
          height={height}
          decoding="async"
          className={`${imgClass} w-auto object-contain ${loaded ? '' : 'hidden'}`}
          onLoad={() => setLoadedSrc(src)}
        />
      ) : null}
      {!loaded && <span className={textClass}>{name}</span>}
    </>
  );
};

const Navbar = () => {
  const { session, signOut } = useAuth();
  const { hasRole } = usePermissions();
  const { settings } = useSiteSettings();
  // Single brand name everywhere; the DB setting is only used for the logo image.
  const siteName = 'QuranVocab';
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = hasRole('admin');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { href: '/collections', label: 'Collections', icon: BookOpen },
    { href: '/names-of-allah', label: '99 Names', icon: Sparkles },
    { href: '/custom-learning', label: 'My collections', icon: Library },
    { href: '/review', label: 'Review', icon: Target },
    { href: '/ramadan', label: 'Ramadan', icon: Moon },
    { href: '/audio-practice', label: 'Audio', icon: Volume2 },
    { href: '/blog', label: 'Blog', icon: Globe }
  ];

  const userMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/notebook', label: 'Notebook', icon: NotebookPen },
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
              {siteName}
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
            <Brand url={settings.logo_url} name={siteName} imgClass="h-8 max-w-[200px]" height={32} textClass="text-xl font-bold" />
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
        
        {/* Shown by CSS, not JS, so the prerendered HTML already has the mobile header. */}
        <div className="flex items-center md:hidden">
          <MobileMenu />
          <Link to="/" className="ml-4 flex items-center">
            <Brand url={settings.logo_url} name={siteName} imgClass="h-6 max-w-[150px]" height={24} textClass="text-lg font-bold" />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other components can go here */}
          </div>
          <nav className="flex items-center space-x-2">
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
