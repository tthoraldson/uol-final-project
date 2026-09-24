import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      port: 3005,
      strictPort: true,
    },
    plugins: [react()],
  };
});