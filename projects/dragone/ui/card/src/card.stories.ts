import { moduleMetadata, type Meta, type StoryObj } from '@analogjs/storybook-angular';

import { Button } from '@dragone/ui/button';

import { Card } from './card';
import { CardBody } from './card-body/card-body';
import { CardFooter } from './card-footer/card-footer';
import { CardHeader } from './card-header/card-header';
import { CardImage } from './card-image/card-image';
import { CardSignature } from './card-signature/card-signature';
import { CardSubtitle } from './card-subtitle/card-subtitle';
import { CardTag } from './card-tag/card-tag';
import { CardText } from './card-text/card-text';
import { CardTitle } from './card-title/card-title';

const cardImports = [
  CardBody,
  CardFooter,
  CardHeader,
  CardImage,
  CardSignature,
  CardSubtitle,
  CardTag,
  CardText,
  CardTitle,
  Button,
];

const meta: Meta<Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: cardImports })],
  argTypes: {
    type: {
      control: 'select',
      options: ['landscape', 'portrait', 'process'],
    },
  },
};

export default meta;
type Story = StoryObj<Card>;

export const Portrait: Story = {
  args: {
    type: 'portrait',
  },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type">
        <drgn-card-image src="https://picsum.photos/seed/card/600/400" alt="Card image" />
        <drgn-card-body>
          <drgn-card-header>
            <drgn-card-tag slot="leading">Categoria</drgn-card-tag>
            <span slot="trailing">13 Nov 2021</span>
          </drgn-card-header>
          <a drgn-card-title href="#" [asHeading]="true">Titolo della card</a>
          <drgn-card-subtitle>Sottotitolo</drgn-card-subtitle>
          <drgn-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
          </drgn-card-text>
          <drgn-card-signature>Firma Autore</drgn-card-signature>
          <drgn-card-footer [type]="type">
            <button drgnButton semantic="ghost" icon>⋮</button>
            <button drgnButton semantic="ghost" icon>⋮</button>
          </drgn-card-footer>
        </drgn-card-body>
      </drgn-card>
    `,
  }),
};

export const Landscape: Story = {
  args: {
    type: 'landscape',
  },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [theme]="theme">
        <drgn-card-image
          src="https://picsum.photos/seed/card/600/400"
          alt="Card image"
          position="left"
        />
        <drgn-card-body>
          <drgn-card-header [type]="type">
            <drgn-card-tag slot="leading">Categoria</drgn-card-tag>
            <span slot="trailing">13 Nov 2021</span>
          </drgn-card-header>
          <a drgn-card-title href="#" [asHeading]="true">Titolo della card</a>
          <drgn-card-subtitle>Sottotitolo</drgn-card-subtitle>
          <drgn-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
          </drgn-card-text>
          <drgn-card-signature>Firma Autore</drgn-card-signature>
          <drgn-card-footer [type]="type">
            <button drgnButton semantic="ghost" icon>⋮</button>
            <button drgnButton semantic="ghost" icon>⋮</button>
          </drgn-card-footer>
        </drgn-card-body>
      </drgn-card>
    `,
  }),
};

export const Process: Story = {
  args: {
    type: 'process',
  },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [theme]="theme">
        <drgn-card-body>
          <drgn-card-header [type]="type">
            <span slot="leading">🔔</span>
            <span slot="trailing">13 Nov 2021</span>
          </drgn-card-header>
          <p drgn-card-title [asHeading]="true">Titolo della card</p>
          <drgn-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
          </drgn-card-text>
          <drgn-card-footer [type]="type">
            <button drgnButton semantic="tertiary">Text</button>
            <button drgnButton semantic="ghost" icon>⋮</button>
          </drgn-card-footer>
        </drgn-card-body>
      </drgn-card>
    `,
  }),
};

export const Dark: Story = {
  args: {
    type: 'portrait',
    theme: 'dark',
  },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [theme]="theme">
        <drgn-card-image src="https://picsum.photos/seed/card/600/400" alt="Card image" />
        <drgn-card-body>
          <drgn-card-header [type]="type">
            <drgn-card-tag slot="leading">Categoria</drgn-card-tag>
            <span slot="trailing">13 Nov 2021</span>
          </drgn-card-header>
          <a drgn-card-title href="#" [asHeading]="true">Titolo della card</a>
          <drgn-card-subtitle>Sottotitolo</drgn-card-subtitle>
          <drgn-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
          </drgn-card-text>
          <drgn-card-signature>Firma Autore</drgn-card-signature>
          <drgn-card-footer [type]="type">
            <button drgnButton semantic="ghost" icon>⋮</button>
            <button drgnButton semantic="ghost" icon>⋮</button>
          </drgn-card-footer>
        </drgn-card-body>
      </drgn-card>
    `,
  }),
};
