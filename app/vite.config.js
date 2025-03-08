// File: vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to your backend server
      '/generate': {
        target: 'http://localhost:3000', // Replace with your backend URL
        changeOrigin: true,
      },
    },
  },
})