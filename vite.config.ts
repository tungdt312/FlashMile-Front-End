import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";
import * as path from "node:path";
import {tanstackRouter} from "@tanstack/router-plugin/vite";
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        react(),
        VitePWA({
                manifest: {
                    background_color: '#ffffff',
                    icons: [
                        {
                            src: '/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'
                        }, {
                            src: '/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'
                        }
                    ],
                    name: 'FlashMile Delivery Application',
                    short_name: 'FlashMile',
                    start_url: '/',
                    theme_color: '#069cff',
                    display: 'standalone',
                },
                workbox: {
                    globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
                },
                registerType: 'autoUpdate', // Tự động cập nhật service worker
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
            }
        ),
        tailwindcss(),

    ],
    resolve: {
        alias: {
            "@":
                path.resolve(__dirname, "./src"),
        }
        ,
    }
    ,
})
