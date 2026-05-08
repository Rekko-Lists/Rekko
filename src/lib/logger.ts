const isDev = import.meta.env.DEV;

export const logger = {
  info:  (...args: unknown[]) => { if (isDev) console.log('[rekko]',  ...args); },
  warn:  (...args: unknown[]) => { if (isDev) console.warn('[rekko]', ...args); },
  error: (...args: unknown[]) => { if (isDev) console.error('[rekko]', ...args); },
};
