# Attribute selector su elemento nativo vs element selector

I Component di `@dragone/ui` usano un **attribute selector su elemento HTML nativo** (`button[drgnButton]`, `input[drgnInputText]`) quando non richiedono un template proprio, preservando così la semantica nativa e l'accessibilità senza costo aggiuntivo. Si usa invece un **element selector** (`drgn-select`, `drgn-checkbox`) quando il Component richiede un template non banale (dropdown, portal, elementi visivi composti) o quando il comportamento dell'elemento nativo è insufficiente per i requisiti implementativi.

La scelta è una breaking change una volta che il Component è pubblicato, quindi va presa deliberatamente. La regola euristica è: *se il Component può vivere senza `template`, usa l'attribute selector*.

## Considered Options

- Attribute selector sempre (come una Directive) — scartato perché alcuni Component hanno template complessi che non si possono esprimere così
- Element selector sempre — scartato perché si perdono semantica nativa, accessibilità e comportamenti browser built-in (form submission, focus management, ecc.)
