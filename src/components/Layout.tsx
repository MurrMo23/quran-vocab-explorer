import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Loaded the first time search opens (closed, it rendered nothing anyway), so it stays out of
// the main bundle and hydration is unaffected.
const GlobalSearch = React.lazy(() => import('./GlobalSearch'));

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
      <Navbar onSearch={handleSearchToggle} />

      {/* Global Search Modal */}
      {isSearchOpen && (
        <React.Suspense fallback={null}>
          <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </React.Suspense>
      )}
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
    </div>;
};
export default Layout;