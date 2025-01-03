import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'src', 'app'),
  build: {
    outDir: path.join(__dirname, 'dist', 'client'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
})
