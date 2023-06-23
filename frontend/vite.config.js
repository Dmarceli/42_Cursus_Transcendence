import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(() => {
  return {
    server: {
      host: true
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'process.env.VUE_APP_BACKEND_URL': JSON.stringify(process.env.VUE_APP_BACKEND_URL)
    }
  }
})
