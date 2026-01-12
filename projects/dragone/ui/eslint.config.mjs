// @ts-check
import { defineConfig } from 'eslint/config';
import rootConfig from '../../../eslint.config.mjs';

export default defineConfig(
  ...rootConfig,
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
  {
    files: ['**/*.html'],
    rules: {},
  },
);
