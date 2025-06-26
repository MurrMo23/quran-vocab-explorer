
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
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
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Practice', href: '/practice', icon: BookOpen },
    { name: 'Quiz', href: '/quiz', icon: Target },
    { name: 'Collections', href: '/collections', icon: Library },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Notebook', href: '/notebook', icon: NotebookPen },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  // Get user metadata safely
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || userEmail.split('@')[0];
  const userAvatar = session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture || '';

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
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
                {navigationItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={`justify-start ${isActive(item.href) ? 'font-semibold' : ''}`}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.name}</span>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </Button>
                {session ? (
                  <Button
                    variant="ghost"
                    className="justify-start"
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
          <Button variant="ghost" className="font-bold text-xl px-2">
            Arabic Vocabulary
          </Button>
          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={isActive(item.href) ? 'font-semibold' : ''}
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span>{item.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Log In
              </Button>
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
