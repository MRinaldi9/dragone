/**
 * Ambient declaration for stylesheet side-effect imports (e.g. the `import './src/main.css'` in
 * `test-setup.ts`).
 *
 * The path is resolved by Vite at build time: `vite.config.ts` sets `root:
 * './projects/dragone/ui'`, so `./src/main.css` resolves to `src/main.css` relative to this
 * project. TypeScript does not resolve the path itself — it only needs to know that `*.css` is a
 * valid module.
 */
declare module '*.css';
