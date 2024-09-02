import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/main.ts',
  output: [
    {
      file: 'dist/main.js',
      format: 'esm',
    },
    {
      file: 'dist/main.min.js',
      format: 'iife',
      name: '$lm',
      plugins: [terser()]
    }],
  plugins: [
    typescript(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
  ],
};