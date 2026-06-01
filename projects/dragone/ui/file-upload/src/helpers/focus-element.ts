import { Directive, ElementRef, inject, input, type OnDestroy, type OnInit } from '@angular/core';

import { toElement } from '@dragone/ui/utils';

import { FocusManager } from './focus-manager';

/**
 * Direttiva ponte tra un chip renderizzato e `FocusManager`.
 *
 * Registra/unregistra il bottone interno del chip usando un identificatore stabile
 * (in questo caso il filename passato via input).
 */
@Directive({
  selector: '[drgnFocusElement]',
  exportAs: 'focusElement',
})
export class FocusElement implements OnInit, OnDestroy {
  readonly filename = input.required<string>({ alias: 'drgnFocusElement' });
  readonly #focusManager = inject(FocusManager);
  readonly #hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Registra il bottone del chip nel manager al mount. */
  ngOnInit(): void {
    const button = toElement(this.#hostElement)?.querySelector('button');

    if (button) {
      this.#focusManager.register(this.filename(), button);
    }
  }

  /** Rimuove il riferimento dal manager all'unmount. */
  ngOnDestroy(): void {
    this.#focusManager.unregister(this.filename());
  }
}
