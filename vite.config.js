import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isTauri = !!process.env.TAURI_ENV_PLATFORM

export default defineConfig({
  plugins: [react()],
  base: isTauri ? './' : '/ShiftMate-ER/',
})
