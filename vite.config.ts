/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, PluginOption } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { coverageConfigDefaults, defaultExclude } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  root: './projects/dragone/ui',
  plugins: [angular() as PluginOption, viteTsconfigPaths()],
  cacheDir: '../../../node_modules/.vite',
  test: {
    globals: true,
    setupFiles: ['./test-setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [...defaultExclude, './projects/dragone/ui/.storybook/**'],
    coverage: {
      reporter: ['lcov', 'html', 'text-summary'],
      reportsDirectory: '../../../coverage/dragone',
      exclude: [
        ...coverageConfigDefaults.exclude,
        'index.ts',
        'public-api.ts',
        '**/*.stories.ts',
        '**/index.ts',
        '**/public-api.ts',
        '**/*.js',
      ],
    },
    browser: {
      enabled: true,
      headless: false,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
