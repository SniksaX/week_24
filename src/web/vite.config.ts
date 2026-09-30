import { fileURLToPath } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

const webRoot = fileURLToPath(new URL('.', import.meta.url))
const envDir = fileURLToPath(new URL('../..', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')
  const apiPort = Number(env.PORT || process.env.PORT || 3000)
  const webPort = Number(env.WEB_PORT || process.env.WEB_PORT || 5173)

  return {
    root: webRoot,
    envDir,
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
        '/health': `http://localhost:${apiPort}`,
      },
    },
  }
})
