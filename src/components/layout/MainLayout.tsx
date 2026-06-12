import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function MainLayout() {
  // El user ya no se persiste en localStorage: se reconstruye fresco desde
  // GET /auth/me en cada arranque (App.tsx) y login, asi que el sync de
  // profileImage que vivia aqui es redundante.
  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <div className="sticky top-0 z-50 bg-app-bg">
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
