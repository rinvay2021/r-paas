import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'http/index': 'src/http/index.ts',
    'moment/index': 'src/moment/index.ts',
    'storage/index': 'src/storage/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  // noExternal: ['axios', 'qs'],
  sourcemap: true,
  treeshake: true,
  splitting: false,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    };
  },
});
