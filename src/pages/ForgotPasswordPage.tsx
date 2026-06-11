import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/common/Button';
import { authService } from '@/lib/authService';
import { extractApiError } from '@/lib/apiErrors';
import Seo from '@/components/seo/Seo';

const styles = {
  page:    'min-h-screen bg-app-bg flex items-center justify-center font-gabarito px-4',
  card:    'bg-surface w-full max-w-[400px] rounded-[10px] shadow-card px-6 py-8 flex flex-col gap-4 sm:px-12 sm:py-10',
  title:   'text-[32px] font-normal text-text-main text-center mb-0',
  subtitle:'text-sm text-text-muted text-center -mt-2',
  input:   'w-full h-[42px] rounded-btn border border-border bg-[rgba(246,246,246,0.6)] shadow-input px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-text-secondary',
  error:   'text-xs text-status-red text-center',
  okBanner:'bg-status-green/10 border border-status-green rounded-[5px] px-3 py-3 text-sm text-status-green text-center',
  link:    'text-center text-xs text-text-muted',
  linkA:   'text-primary hover:underline cursor-pointer',
};

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.requestPasswordReset(email.trim());
      // El backend no revela si la cuenta existe; mensaje neutro.
      setSent(true);
    } catch (err: unknown) {
      setError(extractApiError(err, 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Seo title="Recuperar contraseña" description="Recupera el acceso a tu cuenta de Rekko." noindex />
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Recuperar contraseña</h1>

        {sent ? (
          <>
            <div className={styles.okBanner}>
              Si existe una cuenta con ese email, te hemos enviado un enlace para
              restablecer la contraseña. Revisa tu bandeja (y el spam).
            </div>
            <p className={styles.link}>
              <Link to="/login" className={styles.linkA}>Volver al login</Link>
            </p>
          </>
        ) : (
          <>
            <p className={styles.subtitle}>
              Introduce tu email y te enviaremos un enlace para restablecerla.
            </p>

            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
              required
            />

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
              {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
            </Button>

            <p className={styles.link}>
              ¿Te has acordado?{' '}
              <Link to="/login" className={styles.linkA}>Volver al login</Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
