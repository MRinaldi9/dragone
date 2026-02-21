import type { StorybookConfig } from '@analogjs/storybook-angular';
import { mergeConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
const config: StorybookConfig = {
  stories: ['../projects/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@analogjs/storybook-angular',
    options: {},
  },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      plugins: [viteTsconfigPaths()],
    });
  },
};
export default config;
