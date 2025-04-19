// vite.config.js or vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this 'test' section for Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts', // <-- Point to your setup file
    // Optional: configure css handling if needed
    // css: true,
  },
})