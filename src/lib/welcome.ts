const WELCOME_WINDOW_DAYS = 7;
const DISMISS_KEY = 'rekko-welcome-dismissed';

/** True while the account is within its first week since creation. */
export function isNewUser(createdAt?: string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const ageMs = Date.now() - created;
  return ageMs >= 0 && ageMs < WELCOME_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export function isWelcomeDismissed(): boolean {
  return localStorage.getItem(DISMISS_KEY) === 'true';
}

export function dismissWelcome(): void {
  localStorage.setItem(DISMISS_KEY, 'true');
}
