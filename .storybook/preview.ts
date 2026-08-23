import '../projects/dragone/ui/src/main.css';

import {
  componentWrapperDecorator,
  moduleMetadata,
  type Preview,
} from '@analogjs/storybook-angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';

import docJson from '../documentation.json';
import { ThemeWrapper } from './theme-wrapper';
setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    docs: {
      codePanel: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    darkMode: {
      name: 'Dark Mode',
      description: 'Global control for enabling dark mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'sun',
        items: ['light', 'dark'],
        dynamicTitle: true,
        title: 'Dark Mode',
      },
    },
    ngDevMode: {
      name: 'Angular Dev Mode',
      description: 'Global control for enabling Angular dev mode',
      defaultValue: 'true',
      toolbar: {
        icon: 'power',
        items: ['true', 'false'],
        dynamicTitle: true,
        title: 'Angular Dev Mode',
      },
    },
  },
  initialGlobals: {
    darkMode: 'light',
  },
  decorators: [
    moduleMetadata({ imports: [ThemeWrapper] }),
    componentWrapperDecorator(ThemeWrapper, ({ globals: { darkMode, ngDevMode } }) => ({
      darkMode,
      ngDevMode,
    })),
  ],
};

export default preview;
