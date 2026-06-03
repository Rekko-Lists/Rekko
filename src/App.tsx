import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/useAuthStore';
import { getStoredRefreshToken } from './lib/tokenStorage';
import { authService } from './lib/authService';
import Spinner from './components/ui/common/Spinner';

export default function App() {
  const { accessToken, setAccessToken, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken && !accessToken) {
        try {
          const newToken = await authService.refresh(refreshToken);
          setAccessToken(newToken);
        } catch {
          logout();
        }
      }
      setReady(true);
    }
    init();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
