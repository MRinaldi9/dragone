import type { StorybookConfig } from '@analogjs/storybook-angular';

const config: StorybookConfig = {
  stories: ['../**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@analogjs/storybook-angular',
    options: {},
  },
};
export default config;
