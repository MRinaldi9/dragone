import { componentWrapperDecorator, type Preview } from '@analogjs/storybook-angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    componentWrapperDecorator(
      story =>
        `<div style="display: flex; justify-content: center; align-items: center;">${story}</div>`,
    ),
  ],
};

export default preview;
