import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/JP_StudyApp/',
      manifest: {
        name: '일본어 단어장',
        short_name: '단어장',
        description: '일본어 단어 학습 앱',
        start_url: '/JP_StudyApp/',
        scope: '/JP_StudyApp/',
        display: 'standalone',
        background_color: '#f9fafb',
        theme_color: '#3b82f6',
        icons: [
          {
            src: '/JP_StudyApp/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/JP_StudyApp/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/JP_StudyApp/',
})