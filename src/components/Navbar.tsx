import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from './ui/button';
import {
  BookOpen,
  LogOut,
  Settings,
  BarChart3,
  Volume2,
  Menu,
  Home,
  Target,
  Zap,
  Globe,
  Library,
  NotebookPen,
  Sparkles,
  Moon,
  Search,
  ScrollText,
  GitFork,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';
import { Logo } from './brand/Logo';
import { cn } from '@/lib/utils';

// Main sections, in the order learners use them. "Ramadan" is highlighted in gold.
const navItems = [
  { href: '/review', label: 'Learn', icon: Target },
  { href: '/collections', label: 'Collections', icon: BookOpen },
  { href: '/surahs', label: 'Surahs', icon: ScrollText },
  { href: '/roots', label: 'Roots', icon: GitFork },
  { href: '/names-of-allah', label: '99 Names', icon: Sparkles },
  { href: '/ramadan', label: 'Ramadan', icon: Moon, gold: true },
];

// Secondary destinations: in the mobile menu and the footer.
const moreItems = [
  { href: '/custom-learning', label: 'My collections', icon: Library },
  { href: '/audio-practice', label: 'Audio practice', icon: Volume2 },
  { href: '/blog', label: 'Blog', icon: Globe },
];

// /root/<slug> pages belong to Roots, /surah/<n> to Surahs.
const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`) || ((href === '/roots' || href === '/surahs') && pathname.startsWith(`${href.slice(0, -1)}/`));

const Navbar = ({ onSearch }: { onSearch?: () => void }) => {
  const { session, signOut } = useAuth();
  const { hasRole } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/notebook', label: 'Notebook', icon: NotebookPen },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ...(hasRole('admin') ? [{ href: '/admin', label: 'Admin', icon: Zap }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const linkClass = (href: string, gold?: boolean) =>
    cn(
      'rounded-xl px-3 py-2 text-[15px] font-semibold transition-colors',
      isActive(location.pathname, href)
        ? 'bg-secondary text-secondary-foreground'
        : gold
          ? 'text-gold-text hover:bg-muted'
          : 'text-foreground/75 hover:bg-muted hover:text-foreground',
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        {/* Mobile menu (shown by CSS, so the prerendered HTML already has it). */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-full flex-col gap-6">
              <Link to="/" onClick={closeMenu} aria-label="QuranVocab home">
                <Logo className="h-8" />
              </Link>
              <nav aria-label="Main" className="space-y-1">
                {[...navItems, ...moreItems].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={closeMenu}
                    className={cn('flex items-center gap-3', linkClass(item.href, 'gold' in item ? Boolean(item.gold) : false))}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t border-border pt-4">
                {session ? (
                  <div className="space-y-1">
                    {userMenuItems.map((item) => (
                      <Link key={item.href} to={item.href} onClick={closeMenu} className={cn('flex items-center gap-3', linkClass(item.href))}>
                        <item.icon className="h-5 w-5" aria-hidden="true" />
                        {item.label}
                      </Link>
                    ))}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleSignOut();
                        closeMenu();
                      }}
                      className="w-full justify-start gap-3 px-3"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Button asChild>
                      <Link to="/review" onClick={closeMenu}>Start free</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/auth" onClick={closeMenu}>Sign in</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex shrink-0 items-center" aria-label="QuranVocab home">
          <Logo className="h-8 sm:h-9" />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} className={linkClass(item.href, item.gold)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {onSearch && (
            <Button variant="ghost" size="icon" onClick={onSearch} aria-label="Search words (Ctrl+K)" title="Search (Ctrl+K)" className="border border-border">
              <Search className="h-5 w-5" />
            </Button>
          )}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" aria-label="Account menu">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-secondary font-bold text-secondary-foreground">
                      {session.user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="p-2 text-sm font-semibold">{session.user.email}</div>
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
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth" className="hidden rounded-xl px-3 py-2 text-[15px] font-bold text-foreground hover:bg-muted sm:inline-block">
                Sign in
              </Link>
              <Button asChild size="sm" className="h-10 px-4">
                <Link to="/review">Start free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
