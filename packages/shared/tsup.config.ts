import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'http/index': 'src/http/index.ts',
    'tools/index': 'src/tools/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  external: ['axios', 'qs'],
  sourcemap: true,
  treeshake: true,
  splitting: false,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    };
  },
});
