import type { StorybookConfig } from '@analogjs/storybook-angular';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@analogjs/storybook-angular',
    options: {}
  },
  stories: ['../projects/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      server: {
        watch: {
          ignored: ['**/coverage/**']
        }
      }
    });
  }
};
export default config;
