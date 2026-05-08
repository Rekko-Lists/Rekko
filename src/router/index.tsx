import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import MainLayout    from '@/components/layout/MainLayout';
import Login         from '@/pages/Login';
import Register      from '@/pages/Register';
import Feed          from '@/pages/Feed';
import Explore       from '@/pages/Explore';
import Animes        from '@/pages/Animes';
import List          from '@/pages/List';
import Profile       from '@/pages/Profile';
import Animedle      from '@/pages/Animedle';
import Settings      from '@/pages/Settings';
import DiscordCallback  from '@/pages/DiscordCallback';
import EmailStatusPage  from '@/pages/EmailStatusPage';

function ProtectedRoute() {
  const user = useAuthStore(s => s.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: '/login',                   element: <Login /> },
  { path: '/register',                element: <Register /> },
  { path: '/animedle',                element: <Animedle /> },
  { path: '/oauth/discord/callback',  element: <DiscordCallback /> },
  { path: '/email-verified',          element: <EmailStatusPage /> },
  { path: '/email-changed',           element: <EmailStatusPage /> },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,  element: <Navigate to="/feed" replace /> },
      { path: 'feed',    element: <Feed /> },
      { path: 'explore', element: <Explore /> },
      { path: 'animes',  element: <Animes /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'list',                  element: <List /> },
          { path: 'profile/:username',     element: <Profile /> },
          { path: 'settings',              element: <Settings /> },
        ],
      },
    ],
  },
]);
