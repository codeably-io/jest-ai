import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
import path from 'path';

const entries = [
    './src/index.ts',
    './src/jest-globals.ts',
    './src/matchers/index.ts',
]

export default CLIArgs => {
    const plugins = [
        del({ targets: 'dist/*' }),
        typescript(), // Compiles TypeScript to JavaScript
        resolve(),    // Resolves node_modules imports
        commonjs(),   // Converts CommonJS modules to ES6
    ];
    if (CLIArgs.mini) {
      plugins.push(terser()); // Minify the output (optional)
    }
    return {
        input: entries, // Pointing to your TypeScript entry file
        output: [
            {
                dir: 'dist',
                entryFileNames: '[name].mjs',
                chunkFileNames: '[name]-[hash].mjs',
                format: 'esm',
                sourcemap: CLIArgs.sourcemaps,
            },
            {
                dir: 'dist',
                entryFileNames: '[name].js',
                chunkFileNames: '[name]-[hash].js',
                format: 'cjs',
                sourcemap: CLIArgs.sourcemaps,
            },
        ],
        external: id =>
            !id.startsWith('\0') && !id.startsWith('.') && !path.isAbsolute(id),
        plugins
    }
};