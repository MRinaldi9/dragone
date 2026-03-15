import { defineConfig } from 'oxlint';

import baseConfig from '../oxlint.config.ts';

export default defineConfig({
  extends: [baseConfig],
  overrides: [
    {
      files: ['main.ts'],
      jsPlugins: ['eslint-plugin-storybook'],
      rules: {
        'storybook/no-uninstalled-addons': 'error',
      },
    },
    {
      files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)', '**/*.story.@(ts|tsx|js|jsx|mjs|cjs)'],
      jsPlugins: ['eslint-plugin-storybook'],
      plugins: ['react'],
      rules: {
        'import-x/no-anonymous-default-export': 'off',
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
      },
    },
  ],
});
