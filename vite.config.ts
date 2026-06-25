/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Plugin to resolve Figma's "figma:asset/..." imports to local src/assets/
function figmaAssetPlugin() {
  return {
    name: 'figma-asset-resolver',
    resolveId(source: string) {
      if (source.startsWith('figma:asset/')) {
        const filename = source.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
      return null
    },
  }
}

export default defineConfig({
  base: '/trimble/',
  plugins: [
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Tailwind v4 CSS isn't needed for behavior tests; skipping it keeps the
    // jsdom suite fast and avoids pulling the PostCSS pipeline into tests.
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
