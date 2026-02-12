import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

//  1.npm install firebase react-firebase-hooks ->for install

// 2.createv file for firebase config

// 3.writ function for signin,signup,signout in firebase.js

//4.import all functions in login.jsx

//5.custom notification system implemented