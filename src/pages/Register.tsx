import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '@/components/ui/common/Button';
import { authService, decodeJwtUserId } from '@/lib/authService';
import { signInWithGoogle } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';

const styles = {
  page:      'min-h-screen bg-app-bg flex items-center justify-center font-gabarito',
  card:      'bg-surface w-[400px] rounded-[10px] shadow-card px-12 py-10 flex flex-col gap-3',
  title:     'text-[32px] font-normal text-text-main text-center mb-0',
  input:     'w-full h-[42px] rounded-btn border border-border bg-[rgba(246,246,246,0.6)] shadow-input px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-text-secondary',
  error:     'text-xs text-status-red text-center -mt-1',
  divider:   'flex items-center gap-3 text-text-muted text-xs',
  line:      'flex-1 h-px bg-border',
  socialBtn: 'w-full h-[34px] rounded-btn border border-border bg-surface flex items-center justify-center gap-2 text-xs text-text-main cursor-pointer hover:bg-app-bg transition-colors',
  icon:      'w-4 h-4 object-contain',
  link:      'text-center text-xs text-text-muted',
  linkA:     'text-primary hover:underline cursor-pointer',
};

function validate(form: { email: string; username: string; password: string; passwordRepeat: string }) {
  if (!form.email || !form.username || !form.password || !form.passwordRepeat) return 'All fields are required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email address.';
  if (form.password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(form.password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number.';
  if (form.password !== form.passwordRepeat) return 'Passwords do not match.';
  return null;
}

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '', passwordRepeat: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setError('');
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(form);
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await authService.register(form);
      navigate('/login?registered=true');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    let tokenId: string;
    try {
      tokenId = await signInWithGoogle();
      console.log('[Google OAuth] Firebase tokenId (first 40 chars):', tokenId.slice(0, 40));
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      setError('Google sign-in popup failed. Check your Firebase config.');
      return;
    }
    try {
      console.log('[Google OAuth] Sending POST /oauth/google with tokenId...');
      const { accessToken, refreshToken } = await authService.loginWithGoogle(tokenId);
      console.log('[Google OAuth] Backend response OK:', { accessToken: accessToken.slice(0, 40), refreshToken: refreshToken.slice(0, 20) });

      console.log('[Google OAuth] Raw JWT payload segment:', accessToken.split('.')[1]);
      const userId = decodeJwtUserId(accessToken);
      console.log('[Google OAuth] Decoded userId:', userId);

      console.log('[Google OAuth] Sending GET /user/' + userId);
      const user = await authService.getUserById(userId);
      console.log('[Google OAuth] getUserById response:', user);

      login(user, accessToken, refreshToken, false);
      navigate('/feed');
    } catch (err: unknown) {
      console.error('[Google OAuth] Error caught:', err);
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Backend OAuth failed. Please try again.');
    }
  }

  async function handleDiscordLogin() {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirect = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=identify%20email`;
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Sign Up</h1>

        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
        />
        <input
          className={styles.input}
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={set('username')}
          autoComplete="username"
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={set('password')}
          autoComplete="new-password"
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Repeat Password"
          value={form.passwordRepeat}
          onChange={set('passwordRepeat')}
          autoComplete="new-password"
        />

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </Button>

        <div className={styles.divider}>
          <span className={styles.line} />
          <span>- o -</span>
          <span className={styles.line} />
        </div>

        <button type="button" className={styles.socialBtn} onClick={handleGoogleLogin}>
          <img src="/icon_google.png" alt="Google" className={styles.icon} />
          Sign up with Google
        </button>
        <button type="button" className={styles.socialBtn} onClick={handleDiscordLogin}>
          <img src="/icon_discord.png" alt="Discord" className={styles.icon} />
          Sign up with Discord
        </button>
        <button type="button" className={`${styles.socialBtn} opacity-50 cursor-not-allowed`} disabled>
          <img src="/icon_x.png" alt="X" className={styles.icon} />
          Sign up with X
        </button>

        <p className={styles.link}>
          Already have an account?{' '}
          <Link to="/login" className={styles.linkA}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
