/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';
import { coverageConfigDefaults } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const isHeadless = process.env['VITEST_VSCODE'] === 'true' || process.env['CI'] === 'true';
  return {
    cacheDir: '../../../node_modules/.vite',
    define: {
      'import.meta.vitest': mode !== 'production',
    },
    plugins: [angular()],
    resolve: {
      tsconfigPaths: true,
    },
    root: './projects/dragone/ui',
    test: {
      browser: {
        enabled: true,
        headless: isHeadless,
        instances: [{ browser: 'chromium' }],
        provider: playwright(),
        screenshotFailures: !isHeadless,
        viewport: { height: 1080, width: 1920 },
      },
      coverage: {
        enabled: true,
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
        reporter: ['lcov', 'html', 'text-summary'],
        reportsDirectory: '../../../coverage/dragone',
      },
      globals: true,
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      setupFiles: ['./test-setup.ts'],
      tags: [
        { description: 'Unit tests', name: 'unit' },
        { description: 'Component tests', name: 'component' },
      ],
    },
  };
});
