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
        '@angular-eslint/prefer-standalone': 'error',
        '@angular-eslint/sort-keys-in-type-decorator': 'error',
        '@angular-eslint/sort-lifecycle-methods': 'error',
        '@angular-eslint/use-lifecycle-interface': 'warn',
        '@angular-eslint/use-pipe-transform-interface': 'error',
        'class-methods-use-this': 'off',
        'sort-keys': 'off',
        'new-cap': [
          'warn',
          { capIsNewExceptions: ['Component', 'Pipe', 'Directive', 'Injectable'] },
        ],
      },
    },
    {
      files: ['**/*.stories.ts', '**/*.story.ts'],
      jsPlugins: ['eslint-plugin-storybook'],
      rules: {
        'no-console': 'off',
        'max-statements': 'off',
        'import-x/no-anonymous-default-export': 'off',
        'oxc/no-rest-spread-properties': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'storybook/await-interactions': 'error',
        'storybook/context-in-play-function': 'error',
        'storybook/default-exports': 'error',
        'storybook/hierarchy-separator': 'warn',
        'storybook/no-redundant-story-name': 'warn',
        'storybook/no-renderer-packages': 'error',
        'storybook/prefer-pascal-case': 'warn',
        'storybook/story-exports': 'error',
        'storybook/use-storybook-expect': 'error',
        'storybook/use-storybook-testing-library': 'error',
        'vitest/prefer-importing-vitest-globals': 'off',
      },
    },
  ],
});
