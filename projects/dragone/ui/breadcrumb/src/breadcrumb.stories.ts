import { faSolidHouse } from '@ng-icons/font-awesome/solid';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Breadcrumb } from './breadcrumb';
import { BreadcrumbItem } from './breadcrumb-item/breadcrumb-item';

const meta: Meta<Breadcrumb> = {
  title: 'Dragone/UI/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [BreadcrumbItem], providers: [] })],
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
        routerLink: '/category/subcategory',
      },
      {
        label: 'laudantium',
        routerLink: '/category/subcategory',
      },
      // {
      //   label: 'Nam velit sunt voluptatem ipsum ea inventore tenetur iusto.',
      //   href: '/category/subcategory/current-page',
      // },
    ],
  },
  argTypes: {
    breadcrumbs: { control: { type: 'object' } },
  },
};

export default meta;
type Story = StoryObj<Breadcrumb>;

export const BreadcrumbSingle: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-breadcrumb ${argsToTemplate(args, { exclude: ['darkMode'] })} />
    `,
  }),
};

// export const LongPath: Story = {
//   render: args => ({
//     props: args,
//     template: `
//       <drgn-breadcrumb>
//         <drgn-breadcrumb-item href="#">Home</drgn-breadcrumb-item>
//         <drgn-breadcrumb-item href="#">Primo Livello Molto Lungo</drgn-breadcrumb-item>
//         <drgn-breadcrumb-item href="#">Secondo Livello</drgn-breadcrumb-item>
//         <drgn-breadcrumb-item href="#">Terzo Livello Ancora Più Lungo del Precedente</drgn-breadcrumb-item>
//         <drgn-breadcrumb-item>Pagina Corrente</drgn-breadcrumb-item>
//       </drgn-breadcrumb>
//     `,
//     moduleMetadata: {
//       imports: [DrgnBreadcrumbComponent, DrgnBreadcrumbItemComponent],
//     },
//   }),
// };
