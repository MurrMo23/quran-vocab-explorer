
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Home,
  BookOpen,
  Library,
  Users,
  Settings,
  NotebookPen,
  LogOut,
  LogIn,
  UserPlus,
  Target,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ModeToggle } from '@/components/ModeToggle';

const Navbar = () => {
  const { session, logout } = useAuth();
  const { hasRole } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Practice', href: '/practice', icon: BookOpen, requiresAuth: false },
    { name: 'Quiz', href: '/quiz', icon: Target, requiresAuth: false },
    { name: 'Collections', href: '/collections', icon: Library, requiresAuth: false },
    { name: 'Community', href: '/community', icon: Users, requiresAuth: true },
    { name: 'Notebook', href: '/notebook', icon: NotebookPen, requiresAuth: true },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  // Get user metadata safely
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || userEmail.split('@')[0];
  const userAvatar = session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture || '';

  // Filter navigation items based on auth status
  const filteredNavItems = navigationItems.filter(item => 
    !item.requiresAuth || session
  );

  return (
    <nav className="bg-background border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-64">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate through the app.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-2 mt-4">
                {filteredNavItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={`justify-start ${isActive(item.href) ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'}`}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.name}</span>
                  </Button>
                ))}
                {session && (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </Button>
                )}
                {session ? (
                  <Button
                    variant="ghost"
                    className="justify-start text-destructive hover:bg-destructive/10"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate('/auth')}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      <span>Login</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate('/auth')}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      <span>Register</span>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Enhanced brand logo as clickable link */}
          <Button 
            variant="ghost" 
            className="font-bold text-xl px-2 hover:bg-primary/5 transition-colors"
            onClick={() => navigate('/')}
          >
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Arabic Vocabulary
            </span>
          </Button>
          
          <div className="hidden md:flex items-center space-x-1 ml-6">
            {filteredNavItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={`transition-all duration-200 ${
                  isActive(item.href) 
                    ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span>{item.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ModeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {userEmail}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="hidden sm:inline-flex hover:bg-muted transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Log In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
