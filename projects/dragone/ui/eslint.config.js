// @ts-check
const tseslint = require('typescript-eslint');
const rootConfig = require('../../../eslint.config.js');
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
const storybook = require('eslint-plugin-storybook');

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
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
  storybook.configs['flat/recommended'],
  {
    files: ['.storybook/main.ts', '**/*.stories.ts'],
    rules: {
      'storybook/no-uninstalled-addons': [
        'error',
        { packageJsonLocation: '../../../package.json' },
      ],
    },
  },
  { ignores: ['!.storybook'] },
);
