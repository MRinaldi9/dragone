import { Component } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import {
  injectDocumentActiveElement,
  injectDocumentTitle,
  injectDocumentVisibility
} from './reactive-document';

@Component({
  selector: 'drgn-document-host',
  template: `<button data-testid="target" type="button">target</button>`
})
class DocumentHost {
  readonly visibility = injectDocumentVisibility();
  readonly activeElement = injectDocumentActiveElement();
  readonly documentTitle = injectDocumentTitle();
}

describe('reactive document', () => {
  const originalTitle = document.title;

  afterEach(() => {
    vi.restoreAllMocks();
    document.title = originalTitle;
  });

  it('should expose the initial document state', async () => {
    const { componentClassInstance } = await render(DocumentHost);

    expect(componentClassInstance.visibility()).toBe(document.visibilityState);
    expect(componentClassInstance.activeElement()).toBe(document.activeElement);
    expect(componentClassInstance.documentTitle.title()).toBe(document.title);
  });

  it('should react to visibilitychange events', async () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const { componentClassInstance } = await render(DocumentHost);

    document.dispatchEvent(new Event('visibilitychange'));

    expect(componentClassInstance.visibility()).toBe('hidden');
  });

  it('should track the focused element', async () => {
    const { componentClassInstance, getByTestId } = await render(DocumentHost);

    await getByTestId('target').click();

    expect(componentClassInstance.activeElement()).toBe(getByTestId('target').element());
  });

  it('should update the title through the setTitle action', async () => {
    expect.hasAssertions();
    const { componentClassInstance } = await render(DocumentHost);

    componentClassInstance.documentTitle.setTitle('Reactive Dragone');

    await vi.waitFor(() => {
      expect(componentClassInstance.documentTitle.title()).toBe('Reactive Dragone');
    });
    expect(document.title).toBe('Reactive Dragone');
  });

  it('should observe title writes that bypass setTitle', async () => {
    expect.hasAssertions();
    const { componentClassInstance } = await render(DocumentHost);

    document.title = 'External write';

    await vi.waitFor(() => {
      expect(componentClassInstance.documentTitle.title()).toBe('External write');
    });
  });
});
