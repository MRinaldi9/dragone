import { moduleMetadata, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEllipsis, faSolidFileLines } from '@ng-icons/font-awesome/solid';
import { expect } from 'storybook/test';

import { Button } from '@dragone/ui/button';
import type { LayoutType } from '@dragone/ui/utils';

import { Card } from './card';
import { CardBody } from './card-body/card-body';
import { CardFooter } from './card-footer/card-footer';
import { CardHeader } from './card-header/card-header';
import { CardText } from './card-text/card-text';
import { CardTitle } from './card-title/card-title';

type CardTypographyStoryArgs = Card & { theme: 'light' | 'dark'; layout: LayoutType };

const meta: Meta<CardTypographyStoryArgs> = {
  title: 'Dragone/UI/Card/Typography',
  component: Card,
  tags: ['autodocs'],
  args: {
    type: 'process',
    layout: 'desktop',
    theme: 'light'
  },
  argTypes: {
    type: {
      description: 'The layout type of the card',
      control: 'select',
      options: ['landscape', 'portrait', 'process'],
      table: { defaultValue: { summary: 'process' } }
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
      imports: [CardBody, CardFooter, CardHeader, CardText, CardTitle, Button, NgIcon],
      providers: [provideIcons({ faSolidEllipsis, faSolidFileLines })]
    })
  ]
};

export default meta;
type Story = StoryObj<CardTypographyStoryArgs>;

/**
 * Typography casistiche: text-focused cards showing the type treatments (plain title exposed as
 * heading, body text, footer actions) in both themes. Layout structure lives under
 * `Card/Skeleton`.
 */

/** Process body: icon + date header, plain title, text, text button + overflow action. */
const processBody = `
  <drgn-card-header>
    <ng-icon slot="leading" name="faSolidFileLines" size="2rem" aria-hidden="true" />
    <time slot="trailing" datetime="2021-11-13">13 Nov 2021</time>
  </drgn-card-header>
  <p drgn-card-title [asHeading]="true">Titolo della card</p>
  <drgn-card-text>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
  </drgn-card-text>
  <drgn-card-footer>
    <button drgnButton semantic="tertiary">Text</button>
    <button
      drgnButton
      semantic="ghost"
      iconOnly
      aria-label="Altre azioni"
      aria-haspopup="menu"
      aria-expanded="false"
    >
      <ng-icon name="faSolidEllipsis" size="1rem" />
    </button>
  </drgn-card-footer>
`;

export const Process: Story = {
  args: { type: 'process', layout: 'desktop', theme: 'light' },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [layout]="layout" [theme]="theme">
        <drgn-card-body>${processBody}</drgn-card-body>
      </drgn-card>
    `
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Titolo della card' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Text' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Altre azioni' })).toBeVisible();
  }
};

export const ProcessMobile: Story = {
  args: { type: 'process', layout: 'mobile', theme: 'light' },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [layout]="layout" [theme]="theme">
        <drgn-card-body>${processBody}</drgn-card-body>
      </drgn-card>
    `
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Titolo della card' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Text' })).toBeVisible();
  }
};

export const Dark: Story = {
  args: { type: 'process', layout: 'desktop', theme: 'dark' },
  render: args => ({
    props: args,
    template: `
      <drgn-card [type]="type" [layout]="layout" [theme]="theme">
        <drgn-card-body>${processBody}</drgn-card-body>
      </drgn-card>
    `
  }),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Titolo della card' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Text' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Altre azioni' })).toBeVisible();
  }
};
