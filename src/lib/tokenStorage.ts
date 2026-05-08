const KEY = 'rekko-refresh';

export function storeRefreshToken(token: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(KEY, token);
  } else {
    sessionStorage.setItem(KEY, token);
  }
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
}

export function clearStoredRefreshToken() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
