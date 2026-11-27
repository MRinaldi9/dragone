import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  effect,
  type ElementRef,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidSortDown, faSolidSortUp } from '@ng-icons/font-awesome/solid';
import { injectFormFieldState } from 'ng-primitives/form-field';
import {
  injectSliderState,
  NgpSlider,
  NgpSliderRange,
  NgpSliderThumb,
  NgpSliderTrack
} from 'ng-primitives/slider';

import { injectElementRef, TestId } from '@dragone/ui/utils';

/**
 * A single-value range control composed with the `NgpSlider` primitive: a track, a range, a
 * focusable thumb and a lateral spinbutton with stepper triggers.
 *
 * Use it standalone or inside a `drgn-field` to inherit the field label, description and errors.
 */
@Component({
  selector: 'drgn-slider',
  imports: [NgIcon, NgpSliderRange, NgpSliderThumb, NgpSliderTrack, TestId],
  templateUrl: './slider.html',
  styleUrl: './slider.css',
  providers: [provideIcons({ faSolidSortDown, faSolidSortUp })],
  host: {
    tabindex: '-1',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '[attr.data-invalid]': 'isInvalid() ? "" : null',
    '[attr.hidden]': 'hidden() ? "" : null',
    '[attr.name]': 'name() || null',
    '(focus)': 'onHostFocus()',
    '(focusout)': 'onFocusOut($event)'
  },
  hostDirectives: [
    {
      directive: NgpSlider,
      inputs: [
        'id',
        'ngpSliderMin: min',
        'ngpSliderMax: max',
        'ngpSliderStep: step',
        'ngpSliderDisabled: disabled'
      ]
    }
  ]
})
export class Slider implements FormValueControl<number> {
  /** The current value of the slider. Two-way bound, so `[(value)]` keeps a consumer in sync. */
  readonly value = model<number>(0);
  /**
   * Whether the value can be read but not changed.
   *
   * @default false
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * Whether the slider is hidden.
   *
   * @default false
   */
  readonly hidden = input(false, { transform: booleanAttribute });
  /**
   * Whether the slider displays the invalid state, combined with `touched` for `aria-invalid`.
   *
   * @default false
   */
  readonly invalid = input(false, { transform: booleanAttribute });
  /**
   * The touched status of the control, kept in sync by a parent form.
   *
   * @default false
   */
  readonly touched = input(false, { transform: booleanAttribute });
  /**
   * Whether the value is required.
   *
   * @default false
   */
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * The name of the control, submitted with a form.
   *
   * @default ''
   */
  readonly name = input<string>('');
  /**
   * The fallback accessible name of the thumb when no field label is present.
   *
   * @default 'Valore'
   */
  readonly ariaLabel = input('Valore');
  /**
   * The id (or id list) labelling both the thumb and the spinbutton.
   *
   * @default undefined
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  /**
   * The fallback accessible name of the lateral spinbutton.
   *
   * @default the `ariaLabel` value
   */
  readonly inputAriaLabel = input<string | undefined>(undefined);
  /** Emits when the focus leaves the slider. */
  readonly touch = output<void>();

  readonly #host = injectElementRef<HTMLElement>();
  readonly #sliderState = injectSliderState();
  readonly #formFieldState = injectFormFieldState({ optional: true });
  private readonly thumbRef = viewChild<ElementRef<HTMLElement>>('thumb');

  protected readonly minValue = computed(() => this.#sliderState().min());
  protected readonly maxValue = computed(() => this.#sliderState().max());
  protected readonly stepValue = computed(() => this.#sliderState().step());
  protected readonly isDisabled = computed(() => this.#sliderState().disabled());
  protected readonly isInvalid = computed(() => this.invalid() && this.touched());
  protected readonly fieldLabelledBy = computed(() => {
    const labels = this.#formFieldState()?.labels() ?? [];
    return labels.length > 0 ? labels.join(' ') : null;
  });
  protected readonly thumbLabelledBy = computed(
    () => this.ariaLabelledBy() ?? this.fieldLabelledBy()
  );
  // The thumb keeps its own name only when nothing else labels it.
  protected readonly thumbAriaLabel = computed(() =>
    this.thumbLabelledBy() ? null : this.ariaLabel()
  );
  // The spinbutton falls back to `inputAriaLabel` and then to `ariaLabel`.
  protected readonly inputAriaLabelValue = computed(() =>
    this.thumbLabelledBy() ? null : (this.inputAriaLabel() ?? this.ariaLabel())
  );
  protected readonly ariaDescribedBy = computed(() => {
    const descriptions = this.#formFieldState()?.descriptions() ?? [];
    return descriptions.length > 0 ? descriptions.join(' ') : null;
  });

  constructor() {
    // The primitive owns the value; the model is mirrored into it without echoing `valueChange`.
    effect(() => this.#sliderState().setValue(this.value(), { emit: false }));
    outputToObservable(this.#sliderState().valueChange)
      .pipe(takeUntilDestroyed())
      .subscribe(next => this.value.set(next));
    // `readonly` has no primitive equivalent, so capture-phase guards stop the primitive and the
    // lateral controls before they can change the value.
    const blocked = (event: Event): void => {
      if (this.readonly() || this.isDisabled()) {
        event.stopPropagation();
      }
    };
    this.#host.nativeElement.addEventListener('keydown', blocked, true);
    this.#host.nativeElement.addEventListener('pointerdown', blocked, true);
    // The primitive snaps its own value to the step, while the model keeps the raw number the
    // user is typing; the thumb announces the model so typing stays readable before committing.
    afterRenderEffect(() => {
      const thumb = this.thumbRef()?.nativeElement;
      if (thumb) {
        thumb.setAttribute('aria-valuenow', String(this.value()));
      }
    });
  }

  /** Moves the focus to the slider thumb. */
  focus(options?: FocusOptions): void {
    this.thumbRef()?.nativeElement.focus(options);
  }

  protected increment(): void {
    this.#stepBy(1);
  }

  protected decrement(): void {
    this.#stepBy(-1);
  }

  // A focus on the host element is delegated to the thumb.
  protected onHostFocus(): void {
    this.focus();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.#host.nativeElement.contains(next)) {
      return;
    }
    this.touch.emit();
  }

  // An in-range number applies while the user types; the input is normalized only on commit.
  protected onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    if (raw === '') {
      return;
    }
    const next = Number(raw);
    if (!Number.isFinite(next) || next < this.minValue() || next > this.maxValue()) {
      return;
    }
    this.value.set(next);
  }

  protected onNumberCommit(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    const parsed = raw === '' ? Number.NaN : Number(raw);
    const next = Number.isNaN(parsed) ? this.value() : this.#normalize(parsed);
    this.value.set(next);
    input.value = String(next);
  }

  // Stepping keys move the value on the step grid; `Enter` keeps committing the typed value.
  protected onNumberKeydown(event: KeyboardEvent): void {
    let direction = 0;
    let steps = 1;
    switch (event.key) {
      case 'ArrowUp':
        direction = 1;
        steps = event.shiftKey ? 10 : 1;
        break;
      case 'ArrowDown':
        direction = -1;
        steps = event.shiftKey ? 10 : 1;
        break;
      case 'PageUp':
        direction = 1;
        steps = 10;
        break;
      case 'PageDown':
        direction = -1;
        steps = 10;
        break;
      default:
        return;
    }
    if (this.isDisabled() || this.readonly()) {
      return;
    }
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const next = this.#normalize(this.value() + direction * steps * this.stepValue());
    this.value.set(next);
    input.value = String(next);
  }

  #stepBy(direction: number): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }
    this.value.set(this.#normalize(this.value() + this.stepValue() * direction));
  }

  #normalize(value: number): number {
    const min = this.minValue();
    const max = this.maxValue();
    const step = this.stepValue();
    const clamped = Math.min(Math.max(value, min), max);
    if (!Number.isFinite(step) || step <= 0) {
      return clamped;
    }
    const steps = Math.round((clamped - min) / step);
    const snapped = min + steps * step;
    const precision = Number(snapped.toPrecision(12));
    return Math.min(Math.max(precision, min), max);
  }
}
