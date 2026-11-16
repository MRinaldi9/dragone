import { signal } from '@angular/core';
import { renderDirective } from '@wismaz/vitest-browser-angular';

import { TestId } from './test-id';

describe(TestId, () => {
  const id = signal('target-node');

  afterEach(() => {
    id.set('target-node');
    vi.unstubAllGlobals();
  });

  it('should render data-testid when ngDevMode is enabled', async () => {
    const { getByTestId } = await renderDirective(TestId, {
      template: ` <div [drgnTestId]="id()">Content</div> `,
      hostProps: { id }
    });

    await expect.element(getByTestId('target-node')).toHaveTextContent('Content');

    id.set('updated-node');
    await expect.element(getByTestId('updated-node')).toHaveTextContent('Content');
  });

  it('should not render data-testid when ngDevMode is disabled', async () => {
    vi.stubGlobal('ngDevMode', false);

    const { getByText } = await renderDirective(TestId, {
      template: ` <div [drgnTestId]="id()">Content</div> `,
      hostProps: { id }
    });

    await expect.element(getByText('Content')).not.toHaveAttribute('data-testid');
  });
});
