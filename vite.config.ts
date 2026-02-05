import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'FormGenerator',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'antd', 'react-hook-form', 'moment', 'zod'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
          'react-hook-form': 'ReactHookForm',
          moment: 'moment',
          zod: 'zod',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, 'src/tests/setup.ts'),
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.stories.tsx',
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        'src/main.tsx',
        'src/App.tsx',
        'src/tests/**',
      ],
      reporter: ['text', 'html'],
    },
  },
})
