import { fileURLToPath } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

const webRoot = fileURLToPath(new URL('.', import.meta.url))
const apiPort = Number(process.env.PORT ?? 3000)
const webPort = Number(process.env.WEB_PORT ?? 5173)

// https://vite.dev/config/
export default defineConfig({
  root: webRoot,
  build: {
    outDir: fileURLToPath(new URL('../../dist/web', import.meta.url)),
    emptyOutDir: true,
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: webPort,
    proxy: {
      '/api': `http://localhost:${apiPort}`,
    },
  },
})
