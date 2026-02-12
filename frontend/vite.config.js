import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        allowedHosts: ['losmuchachos.es'],
        proxy: {
            '/api': {
                target: 'http://backend:80',
                changeOrigin: true,
                secure: false,
            }
        },
        watch: {
            usePolling: true
        }
    }
})
