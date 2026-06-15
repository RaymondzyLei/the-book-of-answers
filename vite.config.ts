import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function getBase(): string {
  // Auto-detect repo name from GITHUB_REPOSITORY env (set by GitHub Actions).
  // Locally, falls back to '/' for normal dev work.
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return '/';
  const name = repo.split('/')[1];
  if (!name) return '/';
  return `/${name}/`;
}

export default defineConfig({
  base: getBase(),
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
