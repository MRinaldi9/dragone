# Accessibility Constraints Delegated to Sirio Design Owners

Dragone targets WCAG 2.2 AA in both light and dark themes. However, Dragone is a consumer of the Sirio design system — it does not own the visual design. When a Sirio design token or component specification fails WCAG 2.2 AA (e.g. insufficient contrast ratio in dark mode), Dragone implements the spec faithfully, tracks the issue as a known limitation, and escalates to the Sirio design owners. Dragone does not patch the design by modifying Primitive Tokens or component specs.

Consumers who need to meet accessibility requirements that Sirio does not satisfy can override Component Tokens (`--drgn-*`) locally — this is the supported customization path (see ADR-0003).

## Considered Options

- **Faithful implementation + escalation (chosen)**: Preserve design fidelity, track known issues, escalate to Sirio owners. Consumers override Component Tokens if needed.
- **Local patching**: Modify token values or component styles in Dragone to fix a11y issues. Would diverge from Sirio, break on next design sync, and create maintenance ambiguity about what is "Sirio" vs "Dragone."
- **Refuse to implement non-compliant specs**: Block component development until Sirio fixes the issue. Would halt progress without resolving the problem.

## Consequences

- Some components may ship with known a11y limitations (documented in component-level docs or a tracked issues list).
- A future engineer who sees an a11y failure may assume it is a Dragone bug and try to "fix" it by editing tokens. This ADR and the A11y Escalation term in `CONTEXT.md` clarify that the fix must come from Sirio, not Dragone.
- Consumer Component Token overrides are the escape hatch for organizations with stricter a11y requirements than Sirio provides.
