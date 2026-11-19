import { Outlet } from 'react-router-dom';
import { useLayoutEffect, useRef } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function MainLayout() {
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const oldPadding = root.style.scrollPaddingTop;
    const updateHeight = () => {
      const height = `${header.getBoundingClientRect().height}px`;
      root.style.setProperty('--header-height', height);
      root.style.scrollPaddingTop = height;
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--header-height');
      root.style.scrollPaddingTop = oldPadding;
    };
  }, []);
  // El user ya no se persiste en localStorage: se reconstruye fresco desde
  // GET /auth/me en cada arranque (App.tsx) y login, asi que el sync de
  // profileImage que vivia aqui es redundante.
  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <div ref={headerRef} className="sticky top-0 z-50 bg-app-bg">
        <Navbar />
      </div>
      {/* pb on mobile so content isn't hidden behind the fixed bottom nav */}
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
