import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/angular-vite',
  features: {
    experimentalDocgenServer: true
  },
  stories: ['../projects/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite');
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
