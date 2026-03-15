import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // ─── Plugins ────────────────────────────────────────────────
  plugins: [
    react(),              // Enables JSX transforms and React Fast Refresh in dev
    tailwindcss(),        // Processes Tailwind utility classes via the Vite plugin
  ],
  test: {
    environment: 'jsdom',                   // Simulates a browser DOM for component tests
    globals: true,                         // Exposes describe / it / expect globally (no imports needed)
    setupFiles: './src/setupTests.js',    // Runs before each test file (e.g. jest-dom matchers)
  },
})