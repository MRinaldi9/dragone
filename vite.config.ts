/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { coverageConfigDefaults } from 'vitest/config';

export default defineConfig(({ mode }) => {
  console.log(process.env['CI'] === 'true');
  const isHeadless = process.env['VITEST_VSCODE'] === 'true' || process.env['CI'] === 'true';
  return {
    root: './projects/dragone/ui',
    plugins: [angular(), viteTsconfigPaths()],
    cacheDir: '../../../node_modules/.vite',
    test: {
      tags: [
        { name: 'unit', description: 'Unit tests' },
        { name: 'component', description: 'Component tests' },
      ],
      globals: true,
      watch: true,
      setupFiles: ['./test-setup.ts'],
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
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
        viewport: { width: 1920, height: 1080 },
      },
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
