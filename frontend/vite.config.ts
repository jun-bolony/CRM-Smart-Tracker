// frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env variables to have access to VITE_API_URL for proxy target
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy all /api requests to the backend server
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false, // if using https with self-signed cert
          rewrite: (path) => path, // keep the same path
        },
      },
    },
  };
});