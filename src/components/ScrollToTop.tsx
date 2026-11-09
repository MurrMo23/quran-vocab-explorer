import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the top on every new page, unless the link asked to keep the position (state.keepScroll). */
const ScrollToTop = () => {
  const { pathname, state } = useLocation();
  const keepScroll = !!(state as { keepScroll?: boolean } | null)?.keepScroll;

  useEffect(() => {
    if (!keepScroll) window.scrollTo(0, 0);
    // Only on path changes; keepScroll is read for the navigation that changed the path.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};

export default ScrollToTop;
