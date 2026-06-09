import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Mail, XCircle } from 'lucide-react';

const styles = {
  page: 'min-h-screen bg-app-bg flex items-center justify-center px-4 font-gabarito',
  card: 'w-full max-w-[440px] bg-surface rounded-[10px] shadow-card border border-border px-8 py-10 flex flex-col items-center gap-5',
};

const STATES = {
  success: {
    icon: <CheckCircle size={48} className="text-status-green" />,
    title: 'Password changed!',
    body: 'Your password has been updated successfully. You can now log in with your new password.',
  },
  sent: {
    icon: <Mail size={48} className="text-primary" />,
    title: 'Check your email',
    body: 'A password reset link has been sent to your email address.',
  },
  error: {
    icon: <XCircle size={48} className="text-status-red" />,
    title: 'Something went wrong',
    body: 'The password reset link may have expired. Please request a new one.',
  },
} as const;

export default function PasswordChangedPage() {
  const [searchParams] = useSearchParams();
  const status  = searchParams.get('status');
  const message = searchParams.get('message');

  const state = status === 'success' ? STATES.success : status === null ? STATES.sent : STATES.error;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {state.icon}
        <h1 className="text-2xl font-semibold text-text-main text-center">{state.title}</h1>
        <p className="text-sm text-text-muted text-center">
          {message ?? state.body}
        </p>
        <Link
          to="/login"
          className="mt-2 px-6 py-2.5 bg-gradient-to-b from-slate-500 to-gray-900 text-white rounded-[10px] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
