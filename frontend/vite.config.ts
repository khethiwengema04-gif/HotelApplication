import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://hotelapplication-9a8d.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
