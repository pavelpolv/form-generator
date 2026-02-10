import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-dom/test-utils': path.dirname(require.resolve('react-dom/package.json')) + '/test-utils',
      'react-dom': path.dirname(require.resolve('react-dom/package.json')),
      'react': path.dirname(require.resolve('react/package.json')),
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
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.stories.tsx',
        '**/*.test.{ts,tsx}',
        '**/*.bench.{ts,tsx}',
        '**/index.ts',
        'src/types/config.types.ts',
        'src/types/field.types.ts',
      ],
      reporter: ['text', 'html'],
    },
  },
})
