import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    root: 'src',
    publicDir: '../public',
    server: isDev ? {
      port: 5173,
      host: true,
      open: true
    } : undefined,
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'src/index.html')
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@assets': resolve(__dirname, 'src/assets')
      }
    }
  }
})