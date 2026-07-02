import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    proxy: {
      '/api': {
        target: 'https://localhost:7016',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})