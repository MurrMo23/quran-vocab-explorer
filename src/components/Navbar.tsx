import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const { session, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-primary mr-2" />
              <span className="font-bold text-xl">Quran Vocab Explorer</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/collections" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium">
                Collections
              </Link>
              <Link to="/practice" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium">
                Practice
              </Link>
              <Link to="/audio-practice" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium">
                Audio Practice
              </Link>
              <Link to="/community" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium">
                Community
              </Link>
              <Link to="/blog" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium">
                Blog
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.user_metadata?.avatar_url} alt={session.user?.email || "User Avatar"} />
                      <AvatarFallback>{session.user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}

            <div className="-mr-2 flex md:hidden">
              <Button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={mobileMenuOpen ? "md:hidden block" : "md:hidden hidden"}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/collections"
            className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          >
            Collections
          </Link>
          <Link
            to="/practice"
            className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          >
            Practice
          </Link>
           <Link
            to="/audio-practice"
            className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          >
            Audio Practice
          </Link>
          <Link
            to="/community"
            className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          >
            Community
          </Link>
          <Link
            to="/blog"
            className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
          >
            Blog
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
