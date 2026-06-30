import { Directive, input, type ElementRef } from '@angular/core';

import { toElement } from '@dragone/ui/utils';

/**
 * Coordina il focus dei pulsanti di rimozione chip dopo mutate della lista.
 *
 * API principale: - `focusNext(filename)`: prova a focusare il successivo; se assente usa il
 * precedente; fallback finale al pulsante upload (`fallbackElement`).
 */
@Directive({
  selector: 'ul[drgnFocusManager]',
  exportAs: 'focusManager',
})
export class FocusManager {
  readonly fallbackElement = input<ElementRef<HTMLElement> | null>(null);
  readonly #focusMap = new Map<string, HTMLButtonElement>();

  /** Registra il bottone associato al filename renderizzato in lista. */
  register(filename: string, button: HTMLButtonElement): void {
    this.#focusMap.set(filename, button);
  }

  /** Pulisce il riferimento quando il chip viene distrutto. */
  unregister(filename: string): void {
    this.#focusMap.delete(filename);
  }

  /**
   * Esegue la strategia next/previous + fallback.
   *
   * Nota: il focus e' chiamato dal template su `animate.leave`, quindi avviene quando l'elemento in
   * uscita e' gia' marcato con classe leave.
   */
  focusNext(filename: string): void {
    const tmpArr = [...this.#focusMap.entries()];
    const currIndex = tmpArr.findIndex(([key]) => key === filename);
    const nextIndex =
      currIndex + 1 < tmpArr.length ? currIndex + 1 : currIndex - 1;
    const btnToFocus = tmpArr[nextIndex]?.[1];
    if (btnToFocus && !btnToFocus.disabled) {
      btnToFocus.focus();
      return;
    }

    toElement(this.fallbackElement)?.focus();
  }
}
