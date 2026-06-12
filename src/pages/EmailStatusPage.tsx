import { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import Seo from '@/components/seo/Seo';
import { seoPages } from '@/components/seo/pages';
import { authService } from '@/lib/authService';
import { getStoredRefreshToken } from '@/lib/tokenStorage';
import { useAuthStore } from '@/store/useAuthStore';

const MESSAGES: Record<string, { title: string; body: string; ok: boolean }> = {
  success:          { title: 'Done!',                    body: 'Your email has been confirmed.',                        ok: true  },
  expired:          { title: 'Link expired',             body: 'This link has expired. Please request a new one.',      ok: false },
  invalid:          { title: 'Invalid link',             body: 'This link is invalid or has already been used.',        ok: false },
  user_not_found:   { title: 'User not found',           body: 'We could not find the associated account.',             ok: false },
  token_used:       { title: 'Link already used',        body: 'This confirmation link has already been used.',         ok: false },
  email_taken:      { title: 'Email already taken',      body: 'That email address is already in use.',                 ok: false },
  validation_error: { title: 'Validation error',         body: 'There was a problem with the request. Please retry.',   ok: false },
};

export default function EmailStatusPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') ?? 'invalid';
  const info = MESSAGES[status] ?? MESSAGES['invalid'];
  const refreshed = useRef(false);

  // Tras verificar el email, fuerza un refresh del access token para que el
  // nuevo lleve emailVerified=true al instante (el backend lo exige para
  // postear). Sin esto habria que esperar a que expire el token (15 min).
  useEffect(() => {
    if (status !== 'success' || refreshed.current) return;
    refreshed.current = true;

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return;

    authService
      .refresh(refreshToken)
      .then((newToken) =>
        useAuthStore.getState().setAccessToken(newToken)
      )
      .catch(() => undefined);
  }, [status]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center font-gabarito px-4">
      <Seo
        title={`${seoPages.emailStatus.title}: ${info.title}`}
        description={info.body || seoPages.emailStatus.description}
        canonicalPath={seoPages.emailStatus.path}
        noindex={seoPages.emailStatus.noindex}
      />
      <div className="bg-surface w-full max-w-[380px] rounded-[10px] shadow-card px-6 py-8 flex flex-col items-center gap-4 text-center sm:px-10 sm:py-10">
        {info.ok
          ? <CheckCircle size={48} className="text-status-green" />
          : <XCircle size={48} className="text-status-red" />
        }
        <h1 className="text-2xl font-semibold text-text-main">{info.title}</h1>
        <p className="text-sm text-text-secondary">{info.body}</p>
        <Link
          to="/feed"
          className="mt-2 text-sm text-primary hover:underline"
        >
          Go to Rekko →
        </Link>
      </div>
    </div>
  );
}
