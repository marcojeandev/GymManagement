import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['MJ.ico', 'favicon.ico'],
            manifest: {
                name: 'Gym Management System',
                short_name: 'GymApp',
                description: 'Manage your gym members, contracts, sales and attendance.',
                theme_color: '#ef4444',
                background_color: '#0b0d10',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: '/MJ.ico',
                        sizes: '192x192',
                        type: 'image/x-icon',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/MJ.ico',
                        sizes: '512x512',
                        type: 'image/x-icon',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/localhost:8000\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 5 // 5 minutes
                            }
                        }
                    }
                ],
                // Skip waiting to ensure new version takes over immediately
                skipWaiting: true,
                clientsClaim: true
            },
            // Workaround for development
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],
    server: {
        port: 5173
    },
    build: {
        outDir: 'dist',
        sourcemap: false
    }
});
