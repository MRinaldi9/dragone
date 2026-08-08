# Dragone

An independent Angular design system inspired by the [Sirio](https://www.inps.design/3e7e2b0f5/p/37c451-ciao-italia) design system (INPS), built on [ng-primitives](https://angularprimitives.com) for behavior and accessibility. Targeted at Italian public-sector digital services, released as open source.

## Language

### Architectural Layer

**Primitive**:
A headless Angular directive from ng-primitives that provides behavior and accessibility without styling.
_Avoid_: Headless component, unstyled directive

**Component**:
A styled, themed, accessible Dragone unit that wraps one or more Primitives via `hostDirectives`, remapping inputs/outputs to `drgn-*` names and adding visual design.
_Avoid_: Wrapper, styled primitive

**Children Component**:
An exported part of a composite Component (e.g. `AccordionItem` is a Children Component of `Accordion`).
_Avoid_: Sub-component, part, slot

**Private Component**:
An unexported part of a composite Component used internally (e.g. `AccordionHeader` is a Private Component of `Accordion`).
_Avoid_: Internal part, hidden component

### Token System

**Primitive Token**:
The original Sirio design-system CSS variables in `tokens.css` (e.g. `--color-global-primary-100`). Owned by Sirio, not intended for consumer override.
_Avoid_: Raw token, base token, global token

**Component Token**:
The canonical `--drgn-*` CSS variables in `components.css` that Components consume. The public customization API — consumers may override these to diverge from Sirio.
_Avoid_: Canonical token, drgn token, alias token

### Theming

**Theme**:
A named visual context (light or dark) that remaps the values to which Component Tokens resolve, via a `data-theme` attribute. Component Token names stay the same across themes; only the resolved values change.
_Avoid_: Color scheme, skin, mode

### Forms

**Form Field**:
A composite unit (label + control + description + errors) that wraps a single Field Control. Implemented as `FormContainer`.
_Avoid_: Form group, field wrapper, form element

**Field Control**:
The interactive element projected into a Form Field (e.g. input, select, checkbox).
_Avoid_: Form input, form element

**Form Control**:
A Component that participates in Angular Signal Forms by implementing `FormValueControl` or `FormCheckboxControl`. The interface may be satisfied directly by the Component or by its ng-primitives hostDirective.
_Avoid_: Form element, control value accessor, field

### Visual Variables

**Variant**:
The visual style of a Component (e.g. `primary`, `secondary`, `tertiary`, `ghost`). Button variants follow Sirio specs 1:1, including `danger` as a variant. For other Components, use `status` for semantic meaning.
_Avoid_: Style, appearance, theme (conflicts with Theme)

**Status**:
The semantic meaning of a Component: `info`, `success`, `warning`, `danger`, `neutral`. Exposed via the `status` input.
_Avoid_: Alert, error, type, severity

**Layout**:
The responsive display mode of a Component (e.g. `mobile`, `desktop`). Exposed via the `layout` input.
_Avoid_: Aspect, display mode, breakpoint

**Size**:
The dimensional scale of an interactive Component: `small`, `medium`, `large`. Not all Components have a Size.
_Avoid_: Scale, dimension, spacing

### Accessibility

**A11y Escalation**:
When a Sirio design token or component spec fails WCAG 2.2 AA, Dragone implements the spec faithfully, tracks the issue as a known limitation, and escalates to the Sirio design owners. Dragone does not patch the design. Consumers may override Component Tokens locally.
_Avoid_: A11y workaround, accessibility fix

### Testing

**Test Host**:
A test-only Angular Component that composes a Component under test, binding its signal inputs and observing its outputs, rendered with `render()` from `@wismaz/vitest-browser-angular`. The Component under test stays reactive to signal changes during the test.
_Avoid_: Harness, fixture wrapper, test bench

## Rules

- **WCAG 2.2 AA** is the accessibility standard, in both light and dark themes.
- **Component Token overrides** are the supported customization path. Primitive Tokens are Sirio-owned and must not be overridden by consumers.
- **All documentation is in English.** End-user-facing content (Storybook descriptions, usage guides) may be localized.
- **Signal Forms** are the form integration strategy. `ControlValueAccessor` is not used — `FormValueControl`/`FormCheckboxControl` are the contracts.
