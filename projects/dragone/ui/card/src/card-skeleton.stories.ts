import { moduleMetadata, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBookmark,
  faSolidEllipsis,
  faSolidFileLines,
  faSolidShareNodes
} from '@ng-icons/font-awesome/solid';
import { expect } from 'storybook/test';

import { Button } from '@dragone/ui/button';
import type { LayoutType } from '@dragone/ui/utils';

import { Card } from './card';
import { CardBody } from './card-body/card-body';
import { CardFooter } from './card-footer/card-footer';
import { CardHeader } from './card-header/card-header';
import { CardImage } from './card-image/card-image';
import { CardLink } from './card-link/card-link';
import { CardSignature } from './card-signature/card-signature';
import { CardSubtitle } from './card-subtitle/card-subtitle';
import { CardTag } from './card-tag/card-tag';
import { CardText } from './card-text/card-text';
import { CardTitle } from './card-title/card-title';

type CardSkeletonStoryArgs = Card & { theme: 'light' | 'dark'; layout: LayoutType };

const cardImports = [
  CardBody,
  CardFooter,
  CardHeader,
  CardImage,
  CardLink,
  CardSignature,
  CardSubtitle,
  CardTag,
  CardText,
  CardTitle,
  Button,
  NgIcon
];

const meta: Meta<CardSkeletonStoryArgs> = {
  title: 'Dragone/UI/Card/Skeleton',
  component: Card,
  tags: ['autodocs'],
  args: {
    type: 'portrait',
    layout: 'desktop',
    theme: 'light'
  },
  argTypes: {
    type: {
      description: 'The layout type of the card',
      control: 'select',
      options: ['landscape', 'portrait', 'process'],
      table: { defaultValue: { summary: 'portrait' } }
    },
    layout: {
      description: 'The responsive display mode of the card',
      control: 'select',
      options: ['desktop', 'mobile'],
      table: { defaultValue: { summary: 'desktop' } }
    },
    theme: {
      description: 'The visual theme of the card',
      control: 'select',
      options: ['light', 'dark'],
      table: { defaultValue: { summary: 'light' } }
    }
  },
  decorators: [
    moduleMetadata({
      imports: cardImports,
      providers: [
        provideIcons({ faSolidBookmark, faSolidEllipsis, faSolidFileLines, faSolidShareNodes })
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<CardSkeletonStoryArgs>;

/**
 * Skeleton casistiche: image cards showing the layout structure (image position, stretched link,
 * header/footer rows, mobile spacing) plus the bare `NativeElements` composition without typography
 * helpers. Text treatments live under `Card/Typography`.
 */

const DETAIL_HREF = '/detail';

/** Portrait/landscape footer: share + bookmark icon-only actions. */
const portraitActions = `
  <button drgnButton semantic="ghost" iconOnly aria-label="Condividi">
    <ng-icon name="faSolidShareNodes" size="1rem" />
  </button>
  <button drgnButton semantic="ghost" iconOnly aria-label="Salva nei preferiti">
    <ng-icon name="faSolidBookmark" size="1rem" />
  </button>
`;

/** Portrait/landscape body: tag + date header, link title, subtitle, text, signature. */
const portraitBody = (footer: string): string => `
  <drgn-card-header>
    <drgn-card-tag slot="leading">Categoria</drgn-card-tag>
    <time slot="trailing" datetime="2021-11-13">13 Nov 2021</time>
  </drgn-card-header>
  <h3 style="margin: 0;"><a drgn-card-title href="${DETAIL_HREF}">Titolo della card</a></h3>
  <drgn-card-subtitle>Sottotitolo</drgn-card-subtitle>
  <drgn-card-text>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
  </drgn-card-text>
  <drgn-card-signature>Firma Autore</drgn-card-signature>
  <drgn-card-footer>${footer}</drgn-card-footer>
`;

export const Portrait: Story = {
  args: { type: 'portrait', layout: 'desktop', theme: 'light' },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [layout]="layout" [theme]="theme">
        <a drgn-card-link href="${DETAIL_HREF}" aria-label="Apri il dettaglio della card"></a>
        <drgn-card-image
          src="https://picsum.photos/seed/card/600/400"
          alt="Foto paesaggistica di esempio per la card"
        />
        <drgn-card-body>${portraitBody(portraitActions)}</drgn-card-body>
      </drgn-card>
    `
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Titolo della card' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Apri il dettaglio della card' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Condividi' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Salva nei preferiti' })).toBeVisible();
  }
};

export const PortraitMobile: Story = {
  args: { type: 'portrait', layout: 'mobile', theme: 'light' },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [layout]="layout" [theme]="theme">
        <drgn-card-image
          src="https://picsum.photos/seed/card/600/400"
          alt="Foto paesaggistica di esempio per la card"
        />
        <drgn-card-body>${portraitBody(portraitActions)}</drgn-card-body>
      </drgn-card>
    `
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Titolo della card' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Condividi' })).toBeVisible();
  }
};

export const Landscape: Story = {
  args: { type: 'landscape', layout: 'desktop', theme: 'light' },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [layout]="layout" [theme]="theme">
        <drgn-card-image
          src="https://picsum.photos/seed/card/600/400"
          alt="Foto paesaggistica di esempio per la card"
        />
        <drgn-card-body>${portraitBody(portraitActions)}</drgn-card-body>
      </drgn-card>
    `
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Titolo della card' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Salva nei preferiti' })).toBeVisible();
  }
};

/**
 * Skeleton-only composition: no typography helpers, just native elements projected into the
 * skeleton. Use this shape when the consumer owns the text styles.
 */
export const NativeElements: Story = {
  args: { type: 'portrait', layout: 'desktop', theme: 'light' },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [layout]="layout" [theme]="theme">
        <drgn-card-body>
          <drgn-card-header>
            <span slot="leading">Categoria</span>
            <time slot="trailing" datetime="2021-11-13">13 Nov 2021</time>
          </drgn-card-header>
          <h3 style="margin: 0;"><a href="${DETAIL_HREF}">Titolo della card</a></h3>
          <p style="margin: 0;">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
          </p>
          <drgn-card-footer>
            <button drgnButton semantic="tertiary">Text</button>
          </drgn-card-footer>
        </drgn-card-body>
      </drgn-card>
    `
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Titolo della card' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Text' })).toBeVisible();
  }
};
