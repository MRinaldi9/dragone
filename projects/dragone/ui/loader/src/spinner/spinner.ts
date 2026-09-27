import { Component, input } from '@angular/core';

export type SpinnerSize = 'small' | 'medium' | 'large';
// No ng-primitives Primitive covers an indeterminate loading spinner:
// ng-primitives/progress only models determinate progressbars (value/max) and
// ng-primitives/dialog is a modal dialog with focus trap, which is wrong for a
// loader. This spinner is therefore implemented locally per ADR-0001 and is a
// candidate for upstreaming to ng-primitives.
//
// Visuals match the exported Loader.svg: a 64px ring with a conic fade
// (transparent blue to solid blue) plus a solid head tick at the opaque end,
// rotating as a single group. The exported SVG renders the gradient through a
// foreignObject hack; here it is rebuilt with a token-driven CSS
// conic-gradient plus a mask ring instead. The exported SVG shows no static
// gray track, so the gray construction layer from Penpot is omitted.
@Component({
  selector: 'drgn-spinner',
  template: `
    <div class="spinner-rotor" aria-hidden="true" data-testid="spinner-rotor">
      <div class="spinner-ring" data-testid="spinner-ring"></div>
      <div class="spinner-head" data-testid="spinner-head"></div>
    </div>
  `,
  styleUrl: './spinner.css',
  host: {
    role: 'status',
    '[attr.aria-label]': 'label()',
    '[attr.data-size]': 'size()'
  }
})
export class Spinner {
  /** The size of the spinner. Medium matches the 64px Penpot component. */
  readonly size = input<SpinnerSize>('medium');
  /**
   * Accessible name announced when loading starts. role="status" only takes its name from the
   * author (aria-label), never from contents — hence the binding instead of a text node. Do not
   * pass an empty string: the status would be left without an accessible name.
   *
   * @default 'Caricamento in corso'
   */
  readonly label = input('Caricamento in corso');
}
