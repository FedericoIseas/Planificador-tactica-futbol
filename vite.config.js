import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// base: '/Planificador-tactica-futbol/' for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  base: './',
})
