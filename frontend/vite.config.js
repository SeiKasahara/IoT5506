import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  publicDir: 'public',
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    target: 'modules', 
    outDir: 'dist', 
    assetsDir: 'assets', 
    cssCodeSplit: true, 
    sourcemap: false, 
    minify: 'terser', 
    terserOptions: {
      compress: {
        drop_console: true, 
        drop_debugger: true, 
      },
    },
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
})
