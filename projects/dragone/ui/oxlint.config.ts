import { defineConfig } from 'oxlint';

import baseConfig from '../../../oxlint.config.ts';

export default defineConfig({
  extends: [baseConfig],
  overrides: [
    {
      files: ['**/*.ts'],
      jsPlugins: ['@angular-eslint/eslint-plugin'],
      rules: {
        '@angular-eslint/component-selector': [
          'warn',
          {
            prefix: 'drgn',
            style: 'kebab-case',
            type: ['element', 'attribute'],
          },
        ],
        '@angular-eslint/contextual-lifecycle': 'error',
        '@angular-eslint/no-empty-lifecycle-method': 'error',
        '@angular-eslint/no-input-rename': 'off',
        '@angular-eslint/no-inputs-metadata-property': 'error',
        '@angular-eslint/no-output-native': 'error',
        '@angular-eslint/no-output-on-prefix': 'error',
        '@angular-eslint/no-output-rename': 'error',
        '@angular-eslint/no-outputs-metadata-property': 'error',
        '@angular-eslint/prefer-inject': 'error',
        '@angular-eslint/prefer-on-push-component-change-detection': 'error',
        '@angular-eslint/prefer-standalone': 'error',
        '@angular-eslint/sort-keys-in-type-decorator': 'error',
        '@angular-eslint/sort-lifecycle-methods': 'error',
        '@angular-eslint/use-lifecycle-interface': 'warn',
        '@angular-eslint/use-pipe-transform-interface': 'error',
        'sort-keys': 'off',
      },
    },
  ],
});
