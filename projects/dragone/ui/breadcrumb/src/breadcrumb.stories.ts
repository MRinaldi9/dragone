import {
  argsToTemplate,
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@analogjs/storybook-angular';
import { RouterOutlet } from '@angular/router';
import { faSolidHouse } from '@ng-icons/font-awesome/solid';

import { Breadcrumb } from './breadcrumb';
import { BreadcrumbItem } from './breadcrumb-item/breadcrumb-item';

const meta: Meta<Breadcrumb> = {
  title: 'Dragone/UI/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [BreadcrumbItem, RouterOutlet], providers: [] })],
  args: {
    breadcrumbs: [
      {
        label: 'quis',
        routerLink: '/',
        icon: faSolidHouse,
      },
      {
        label: 'ullam',
        routerLink: '/category',
      },
      {
        label: 'officiis',
        routerLink: '/category/subcategory',
      },
      {
        label: 'deleniti',
        routerLink: '/category/subcategory/1',
      },
      {
        label: 'laudantium',
        routerLink: '/category/subcategory/2',
      },
      {
        label: 'voluptatem ipsum',
      },
    ],
  },
  argTypes: {
    breadcrumbs: { control: { type: 'object' } },
  },
};

export default meta;
type Story = StoryObj<Breadcrumb>;

export const BreadcrumbDefault: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="display:flex; flex-direction: column; gap: 2rem; align-items: center; padding: 2rem;">
        <drgn-breadcrumb ${argsToTemplate(args, { exclude: ['darkMode'] })} />
        <router-outlet/>
      </div>
    `,
  }),
};
