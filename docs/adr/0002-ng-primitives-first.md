# ng-primitives come layer primario di comportamento

I Component di `@dragone/ui` delegano **tutto il comportamento headless** (state management, accessibilità, keyboard interactions, ARIA) a `ng-primitives` tramite `hostDirectives`, anziché reimplementarlo o usare CDK. La logica propria di Dragone si limita alla presentazione (tokens CSS, data-attributes per varianti visive) e alla surface API (signal inputs/outputs che wrappano quelli della Primitiva).

Il flusso di sviluppo di un nuovo Component è: consultare ng-primitives MCP → identificare la Primitiva corrispondente → comporre via `hostDirectives` + `inject*State()` → aggiungere solo ciò che ng-primitives non copre.

## Considered Options

- Angular CDK — scartato perché ng-primitives offre primitive già orientate al pattern headless/composable con meno boilerplate
- Implementazione custom — scartata perché duplicherebbe a11y e interaction logic già battle-tested

## Consequences

Se una Primitiva non esiste in ng-primitives, si implementa la logica minima necessaria nel Component stesso, ma si considera di contribuire la Primitiva upstream.
