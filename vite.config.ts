import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const envPath = path.resolve(process.cwd(), '.env');
  const localNodeEnv = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf8').match(/^\s*NODE_ENV\s*=\s*["']?([^"'\s#]+)["']?\s*(?:#.*)?$/m)?.[1]
    : undefined;
  const environment = localNodeEnv || process.env.NODE_ENV || mode;
  if (environment !== 'development' && environment !== 'production') {
    throw new Error('NODE_ENV must be development or production');
  }
  const suffix = environment === 'development' ? 'DEV' : 'PROD';
  const names = ['VITE_API_BASE_URL', 'VITE_DISCORD_CLIENT_ID', 'VITE_DISCORD_REDIRECT_URI'];
  const define = Object.fromEntries(names.map((name) => {
    const value = env[`${name}_${suffix}`];
    if (!value) throw new Error(`Missing ${name}_${suffix}`);
    return [`import.meta.env.${name}`, JSON.stringify(value)];
  }));
  return {
    plugins: [react()],
    define,
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
  };
});
