import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  // Base path para GitHub Pages (el sitio vive en /entrevelas/).
  // En desarrollo local Vite usa '/'.
  base: process.env.NODE_ENV === 'production' ? '/entrevelas/' : '/',
})
