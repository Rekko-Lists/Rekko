import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService, decodeJwtUserId } from '@/lib/authService';
import { useAuthStore } from '@/store/useAuthStore';
import Seo from '@/components/seo/Seo';
import { seoPages } from '@/components/seo/pages';

export default function DiscordCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    if (!code) {
      navigate('/login');
      return;
    }

    async function exchange() {
      try {
        const { accessToken, refreshToken } = await authService.loginWithDiscord(code!);
        const userId = decodeJwtUserId(accessToken);
        const fullUser = await authService.getUserById(userId);
        login(fullUser, accessToken, refreshToken, false);
        navigate('/feed');
      } catch {
        navigate('/login');
      }
    }

    exchange();
  }, []);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center font-gabarito">
      <Seo
        title={seoPages.discordCallback.title}
        description={seoPages.discordCallback.description}
        canonicalPath={seoPages.discordCallback.path}
        noindex={seoPages.discordCallback.noindex}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-text-muted">Connecting with Discord...</p>
      </div>
    </div>
  );
}
