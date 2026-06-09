import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Button from '@/components/ui/common/Button';
import { authService, decodeJwtUserId } from '@/lib/authService';
import { signInWithGoogle } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { extractApiError } from '@/lib/apiErrors';
import { logger } from '@/lib/logger';
import Seo from '@/components/seo/Seo';
import { seoPages } from '@/components/seo/pages';

const styles = {
  page:      'min-h-screen bg-app-bg flex items-center justify-center font-gabarito',
  card:      'bg-surface w-[400px] rounded-[10px] shadow-card px-12 py-10 flex flex-col gap-3',
  title:     'text-[32px] font-normal text-text-main text-center mb-0',
  successBanner: 'bg-status-green/10 border border-status-green rounded-[5px] px-3 py-2 text-xs text-status-green text-center',
  input:     'w-full h-[42px] rounded-btn border border-border bg-[rgba(246,246,246,0.6)] shadow-input px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-text-secondary',
  row:       'flex items-center justify-between text-xs',
  check:     'flex items-center gap-2 cursor-pointer text-text-secondary',
  forgot:    'text-primary text-xs cursor-pointer hover:underline',
  error:     'text-xs text-status-red text-center -mt-1',
  divider:   'flex items-center gap-3 text-text-muted text-xs',
  line:      'flex-1 h-px bg-border',
  socialBtn: 'w-full h-[34px] rounded-btn border border-border bg-surface flex items-center justify-center gap-2 text-xs text-text-main cursor-pointer hover:bg-app-bg transition-colors',
  icon:      'w-4 h-4 object-contain',
  link:      'text-center text-xs text-text-muted',
  linkA:     'text-primary hover:underline cursor-pointer',
};

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const { login } = useAuthStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken, refreshToken, user } = await authService.login(email, password);
      const fullUser = await authService.getUserByUsername(user.username);
      login(fullUser, accessToken, refreshToken, remember);
      navigate('/feed');
    } catch (err: unknown) {
      setError(extractApiError(err, 'Unable to sign in. Please check your credentials and try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    let tokenId: string;
    try {
      tokenId = await signInWithGoogle();
      logger.info('Google OAuth: Firebase token obtained');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      setError('Google sign-in popup failed. Check your Firebase config.');
      return;
    }
    try {
      const { accessToken, refreshToken } = await authService.loginWithGoogle(tokenId);
      const userId = decodeJwtUserId(accessToken);
      logger.info('Google OAuth: userId decoded', userId);
      const fullUser = await authService.getUserById(userId);
      login(fullUser, accessToken, refreshToken, remember);
      navigate('/feed');
    } catch (err: unknown) {
      logger.error('Google OAuth error', err);
      setError(extractApiError(err, 'Google sign-in failed. Please try again in a moment.'));
    }
  }

  async function handleDiscordLogin() {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirect = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=identify%20email`;
  }

  return (
    <div className={styles.page}>
      <Seo
        title={seoPages.login.title}
        description={seoPages.login.description}
        canonicalPath={seoPages.login.path}
        noindex={seoPages.login.noindex}
      />
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Login</h1>

        {justRegistered && (
          <div className={styles.successBanner}>
            Account created! Please log in.
          </div>
        )}

        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          autoComplete="email"
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          autoComplete="current-password"
        />

        <div className={styles.row}>
          <label className={styles.check}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-primary" />
            Remember me
          </label>
          <span className={styles.forgot}>Forgot password?</span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'LOGGING IN...' : 'LOGIN'}
        </Button>

        <div className={styles.divider}>
          <span className={styles.line} />
          <span>- o -</span>
          <span className={styles.line} />
        </div>

        <button type="button" className={styles.socialBtn} onClick={handleGoogleLogin}>
          <img src="/icon_google.png" alt="Google" className={styles.icon} />
          Login with Google
        </button>
        <button type="button" className={styles.socialBtn} onClick={handleDiscordLogin}>
          <img src="/icon_discord.png" alt="Discord" className={styles.icon} />
          Login with Discord
        </button>
        <button type="button" className={`${styles.socialBtn} opacity-50 cursor-not-allowed`} disabled>
          <img src="/icon_x.png" alt="X" className={styles.icon} />
          Login with X
        </button>

        <p className={styles.link}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.linkA}>Sign up</Link>
        </p>
      </form>
    </div>
  );
}
