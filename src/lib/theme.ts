export function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.dataset.theme = dark ? 'rekkoDark' : 'rekko';
  try {
    localStorage.setItem('rekko-theme', dark ? 'dark' : 'light');
  } catch {
    // Theme remains active for this session if storage is unavailable.
  }
}

export async function saveTheme(
  dark: boolean,
  saveRemote: (dark: boolean) => Promise<unknown>,
): Promise<void> {
  const previous = document.documentElement.classList.contains('dark');
  applyTheme(dark);
  try {
    await saveRemote(dark);
  } catch (error) {
    applyTheme(previous);
    throw error;
  }
}
