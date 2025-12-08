import { applicationConfig, type Preview } from '@analogjs/storybook-angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import fakeRoutes from '../projects/dragone/ui/breadcrumb/src/test.routes';
import docJson from '../documentation.json';
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
  args: {
    darkMode: false,
  },
  argTypes: {
    darkMode: {
      description: 'Global control for enabling dark mode',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  decorators: [
    applicationConfig({ providers: [provideRouter(fakeRoutes), provideZonelessChangeDetection()] }),
    (storyFn, { args }) => {
      const story = storyFn();

      // 2. Estraiamo il valore di 'darkMode' dal contesto
      const darkMode = args['darkMode'] as boolean;

      // 3. Determiniamo i colori e la classe del tema
      const backgroundColor = darkMode ? '#002460' : '#FFFFFF';
      const themeClass = darkMode ? 'drgn-dark' : '';

      // 4. Modifichiamo il template della storia per avvolgerlo nel nostro div dinamico
      story.template = `
        <div
          class="${themeClass}"
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: ${backgroundColor};
            padding: 2rem;
            transition: background-color 0.3s;
          "
        >
          ${story.template}
        </div>
      `;

      // 5. Restituiamo l'oggetto storia modificato
      return story;
    },
  ],
};

export default preview;
