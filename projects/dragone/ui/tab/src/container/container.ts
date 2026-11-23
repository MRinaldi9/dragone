import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChildren, ElementRef, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import {
  injectTabsetState,
  NgpTabButton,
  NgpTabList,
  NgpTabPanel,
  NgpTabset
} from 'ng-primitives/tabs';

import { TestId, Theme } from '@dragone/ui/utils';

import { Tab } from '../tab/tab';

/** The orientation of the tab list and its keyboard navigation axis. */
export type TabOrientation = 'horizontal' | 'vertical';

/**
 * Tabs container (`TabContainer`): renders a `role="tablist"` from the projected `<drgn-tab>`
 * children and the matching `role="tabpanel"` elements. Bind `[(value)]` to track and drive the
 * selected tab.
 */
@Component({
  selector: 'drgn-tab-container',
  imports: [NgTemplateOutlet, NgIcon, NgpTabList, NgpTabButton, NgpTabPanel, TestId],
  templateUrl: './container.html',
  styleUrl: './container.css',
  host: {
    '[attr.data-orientation]': 'orientation()'
  },
  hostDirectives: [
    {
      directive: NgpTabset,
      inputs: [
        'id',
        'ngpTabsetValue:value',
        'ngpTabsetOrientation:orientation',
        'ngpTabsetActivateOnFocus:activateOnFocus',
        'ngpTabsetWrap:wrap'
      ],
      outputs: ['ngpTabsetValueChange:valueChange']
    },
    { directive: Theme, inputs: ['theme'] }
  ]
})
export class Container {
  /** The accessible name of the tab list. */
  readonly ariaLabel = input<string>();

  readonly #tabsetState = injectTabsetState();
  protected readonly orientation = computed(() => this.#tabsetState().orientation());
  protected readonly tabs = contentChildren(Tab);

  constructor() {
    // Also reflected at creation, so the attribute exists before the first change-detection pass.
    inject(ElementRef<HTMLElement>).nativeElement.setAttribute(
      'data-orientation',
      this.orientation()
    );
  }

  /** Selects the tab with the given value. */
  select(value: string): void {
    this.#tabsetState().select(value);
  }

  protected isSvgIcon(icon: string): boolean {
    return icon.trim().startsWith('<svg');
  }

  protected isTabActive(tabValue: string): boolean {
    const selected = this.#tabsetState().selectedTab();
    if (selected !== undefined) {
      return selected === tabValue;
    }
    // Before the buttons register on first mount, fall back to the tab NgpTabset will select.
    return (
      this.tabs()
        .find(tab => !tab.disabled())
        ?.value() === tabValue
    );
  }
}
