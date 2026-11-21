import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    maxWorkers: 1,
    testTimeout: 20000,
    setupFiles: './src/tests/setup.js',
    coverage: { provider: 'v8', reporter: ['text', 'html'], include: ['src/**/*.{js,jsx}'], exclude: ['src/tests/**', 'src/main.jsx'] },
  },
})
