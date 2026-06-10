import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/lib/authService';

export default function MainLayout() {
  const { user, accessToken, setUser } = useAuthStore();
  const syncedUserId = useRef<number | null>(null);

  // Sync profileImage from server once per user+session.
  // The persisted store can have a stale profileImage from a previous session.
  // Re-runs if the logged-in user changes (e.g. logout → login as someone else).
  useEffect(() => {
    if (!user || !accessToken) return;
    if (syncedUserId.current === user.userId) return;
    syncedUserId.current = user.userId;
    authService.getUserProfile(user.username)
      .then(data => {
        const fresh = data.profileImage ?? user.profileImage;
        if (fresh !== user.profileImage) {
          setUser({ ...user, profileImage: fresh });
        }
      })
      .catch(() => {});
  }, [user?.userId, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

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
