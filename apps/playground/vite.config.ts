import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Plugin to serve metrics directory
function serveMetricsPlugin(): Plugin {
  return {
    name: 'serve-metrics',
    configureServer(server) {
      server.middlewares.use('/api/metrics', (_req, res) => {
        const metricsPath = path.resolve(__dirname, './metrics/results.json')
        if (fs.existsSync(metricsPath)) {
          const data = fs.readFileSync(metricsPath, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } else {
          res.statusCode = 404
          res.end(JSON.stringify({ error: 'Metrics file not found' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveMetricsPlugin()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Используем dist библиотеки (после билда)
      '@form-generator/core': path.resolve(__dirname, '../../packages/form-generator/dist'),
    },
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['@form-generator/core'],
  },
})
