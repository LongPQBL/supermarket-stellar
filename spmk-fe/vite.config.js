import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@stellar/stellar-sdk': path.resolve('node_modules/@stellar/stellar-sdk'),
      '@stellar/stellar-base': path.resolve('node_modules/@stellar/stellar-base'),
    },
    dedupe: ['@stellar/stellar-sdk', '@stellar/stellar-base', '@stellar/js-xdr'],
  },
})
