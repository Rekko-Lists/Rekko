import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Button from '@/components/ui/common/Button';

const BASE = import.meta.env.VITE_API_BASE_URL as string;

const styles = {
  page:    'min-h-screen bg-app-bg flex items-center justify-center px-4 font-gabarito',
  card:    'w-full max-w-[480px] bg-surface rounded-[10px] shadow-card border border-border px-8 py-10 flex flex-col gap-6',
  title:   'text-3xl font-semibold text-text-main text-center',
  label:   'text-sm font-medium text-text-main',
  input:   'w-full h-[46px] rounded-[8px] border border-border bg-app-bg px-4 text-sm text-text-main focus:outline-none focus:border-primary transition-colors',
  err:     'text-xs text-status-red text-center',
  ok:      'text-xs text-status-green text-center',
  hint:    'text-xs text-text-muted mt-1',
};

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get('username') ?? '';
  const token    = searchParams.get('token') ?? '';

  const [password,       setPassword]       = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState('');

  if (!username || !token) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className="text-center text-text-muted text-sm">Invalid or missing reset link parameters.</p>
          <Link to="/login" className="text-center text-sm text-primary hover:underline">Back to login</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordRepeat) {
      setError("Passwords don't match.");
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const resp = await fetch(
        `${BASE}/user/${encodeURIComponent(username)}/reset-password?token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, token, password, passwordRepeat }),
          redirect: 'manual',
        }
      );
      if (resp.type === 'opaqueredirect' || resp.ok) {
        navigate('/password-changed?status=success');
        return;
      }
      const data = await resp.json().catch(() => null) as Record<string, unknown> | null;
      setError((data?.message as string) ?? 'Failed to reset password. Please try again.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Set new password</h1>
        <p className="text-sm text-text-muted text-center">
          Setting password for <strong>{username}</strong>
        </p>

        <div className="flex flex-col gap-1.5">
          <label className={styles.label}>New password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
          />
          <p className={styles.hint}>Must contain uppercase, lowercase, and a number.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={styles.label}>Repeat password</label>
          <input
            className={styles.input}
            type="password"
            value={passwordRepeat}
            onChange={e => setPasswordRepeat(e.target.value)}
            placeholder="Repeat your new password"
            required
          />
        </div>

        {error && <p className={styles.err}>{error}</p>}

        <Button variant="primary" type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Resetting…' : 'Reset password'}
        </Button>

        <Link to="/login" className="text-center text-sm text-primary hover:underline">
          Back to login
        </Link>
      </form>
    </div>
  );
}
