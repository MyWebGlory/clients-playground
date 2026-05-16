import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url ? new URL(req.url, 'http://localhost') : null
          const pathname = url?.pathname ?? ''
          const isSpaRoute = [
            /^\/clients\/[^/]+\/?$/,
            /^\/clients\/[^/]+\/projects\/[^/]+\/?$/,
            /^\/projects\/[^/]+\/?$/,
          ].some((pattern) => pattern.test(pathname))

          if (isSpaRoute && !pathname.endsWith('.html')) {
            req.url = '/'
          }
          next()
        })
      },
    },
    {
      name: 'watch-public',
      configureServer(server) {
        // Watch all files under public/ (static project HTML, CSS, images, etc.)
        // and trigger a full-page reload whenever any of them change.
        server.watcher.add(path.resolve(__dirname, 'public'))
        server.watcher.on('change', (file) => {
          if (file.includes(`${path.sep}public${path.sep}`)) {
            server.ws.send({ type: 'full-reload', path: '*' })
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
