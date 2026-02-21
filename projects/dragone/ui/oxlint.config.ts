import { defineConfig } from 'oxlint';
import baseConfig from '../../../oxlint.config.ts';

export default defineConfig({
  extends: [baseConfig],
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      plugins: ['vitest'],
      rules: {
        'vitest/no-disabled-tests': 'error',
        'vitest/no-focused-tests': 'error',
        'vitest/no-identical-title': 'error',
        'vitest/no-mocked-imports': 'warn',
        'vitest/no-standalone-expect': 'error',
        'no-undef': 'off',
      },
    },
    {
      files: ['**/*.ts'],
      rules: {
        '@angular-eslint/component-selector': [
          'warn',
          {
            type: ['element', 'attribute'],
            prefix: 'drgn',
            style: 'kebab-case',
          },
        ],
      },
    },
  ],
});
