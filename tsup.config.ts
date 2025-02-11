import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  minify: true,
  sourcemap: true,
  dts: true,
  clean: true
})
