import { defineConfig } from 'oxlint';

import baseConfig from '../oxlint.config.ts';

export default defineConfig({
  extends: [baseConfig],
  overrides: [
    {
      files: ['main.ts', 'preview.ts'],
      jsPlugins: ['eslint-plugin-storybook'],
      rules: {
        'sort-keys': 'off',
        'storybook/no-uninstalled-addons': 'error',
        'vitest/require-hook': 'off',
      },
    },
  ],
});
