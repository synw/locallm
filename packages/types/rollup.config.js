import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts',
  output: [
    {
      file: 'dist/main.js',
      format: 'esm'
    },
  ],
  plugins: [
    typescript(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
  ],
};