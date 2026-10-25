// frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load env variables to have access to VITE_API_URL for proxy target
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    resolve: {
      // Pin a single copy of React to prevent duplicate instance issues (React error #321)
      alias: {
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      // Additional safety net against duplicated React copies
      dedupe: ['react', 'react-dom', 'react-router-dom'],
    },
    // Pre-bundle core runtime dependencies to avoid mid-session re-optimization
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'],
    },
    server: {
      proxy: {
        // Proxy all /api requests to the backend server
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false, // if using https with self-signed cert
          timeout: 120000,
          proxyTimeout: 120000,
          rewrite: (path) => path, // keep the same path
        },
      },
    },
  };
});