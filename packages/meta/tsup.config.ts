import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  outDir: 'dist',
  sourcemap: true,
  treeshake: true,
  splitting: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.js' : '.mjs' };
  },
});
