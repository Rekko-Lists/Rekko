import { useEffect, useRef, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/useAuthStore';
import { getStoredRefreshToken } from './lib/tokenStorage';
import { authService } from './lib/authService';
import Spinner from './components/ui/common/Spinner';

export default function App() {
  const { setAccessToken, logout } = useAuthStore();
  const [ready, setReady] = useState(false);
  // Prevents double-invocation in React 18 StrictMode from consuming
  // the refresh token twice (second call would fail and trigger logout)
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    async function init() {
      const refreshToken = getStoredRefreshToken();
      // Only attempt silent refresh if there is a stored token.
      // Read accessToken from the store directly (not from the closure)
      // so StrictMode's second invocation guard is the only protection needed.
      if (refreshToken) {
        const currentToken = useAuthStore.getState().accessToken;
        if (!currentToken) {
          try {
            const newToken = await authService.refresh(refreshToken);
            setAccessToken(newToken);
          } catch {
            logout();
          }
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
