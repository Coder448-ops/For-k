import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base is relative so the built site deploys to any static host / sub-path
// (GitHub Pages project sites, Netlify, Vercel, Cloudflare Pages…) without changes.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Allow the sandboxed preview proxy host (no secrets here — static site)
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
