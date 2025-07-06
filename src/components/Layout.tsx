import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import GlobalSearch from './GlobalSearch';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
const Layout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen(true);
    }
  };
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Global Search Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button onClick={handleSearchToggle} size="icon" className="h-12 w-12 rounded-full shadow-lg" title="Search (Ctrl+K)">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      <main className="flex-1 px-0 mx-[10px]">
        <Outlet />
      </main>
      
      <Footer />
      <Toaster />
    </div>;
};
export default Layout;