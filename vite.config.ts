/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { coverageConfigDefaults, defaultExclude } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const isHeadless =
    process.env['VITEST_VSCODE'] === 'true' || process.env['CI'] === 'true';
  return {
    root: './projects/dragone/ui',
    plugins: [angular(), viteTsconfigPaths()],
    cacheDir: '../../../node_modules/.vite',
    test: {
      globals: true,
      watch: true,
      setupFiles: ['./test-setup.ts'],
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [...defaultExclude, './projects/dragone/ui/.storybook/**'],
      coverage: {
        enabled: true,
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
          '**/*.css',
        ],
      },
      browser: {
        enabled: true,
        headless: isHeadless,
        provider: playwright(),
        instances: [{ browser: 'chromium' }],
        screenshotFailures: !isHeadless,
      },
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
