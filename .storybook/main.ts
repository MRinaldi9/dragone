import { type StorybookConfig } from '@analogjs/storybook-angular';

const config: StorybookConfig = {
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@analogjs/storybook-angular',
    options: {},
  },
  stories: ['../projects/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
};
export default config;
