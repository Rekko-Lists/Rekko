import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Login   from '@/pages/Login';
import Feed    from '@/pages/Feed';
import Explore from '@/pages/Explore';
import Animes  from '@/pages/Animes';
import List    from '@/pages/List';
import Profile from '@/pages/Profile';
import Animedle from '@/pages/Animedle';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,              element: <Navigate to="/feed" replace /> },
      { path: 'feed',             element: <Feed /> },
      { path: 'explore',          element: <Explore /> },
      { path: 'animes',           element: <Animes /> },
      { path: 'list',             element: <List /> },
      { path: 'profile/:username',element: <Profile /> },
      { path: 'animedle',         element: <Animedle /> },
    ],
  },
]);
