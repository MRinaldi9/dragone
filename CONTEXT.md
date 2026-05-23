# Dragone

Dragone è un design system Angular che estende e implementa [Sirio](https://www.inps.design/3e7e2b0f5/p/37c451-ciao-italia) (il design system INPS). `@dragone/ui` è la libreria di componenti Angular che ne costituisce l'implementazione concreta.

## Language

**Dragone**:
Il progetto nel suo complesso — design system, tooling, convenzioni. Superset di Sirio.
_Avoid_: framework, sistema, design system Dragone (è il progetto, non solo il design system)

**Sirio**:
Il design system INPS di riferimento da cui Dragone eredita visual language e token. Dragone lo estende ma non lo sostituisce.
_Avoid_: design system (da solo, ambiguo tra Sirio e Dragone)

**@dragone/ui**:
La libreria Angular di componenti. Distribuita come secondary entry points (`@dragone/ui/button`, `@dragone/ui/checkbox`, ecc.). È l'artefatto pubblicabile di Dragone.
_Avoid_: "la libreria Dragone" (usa sempre `@dragone/ui`)

**Component**:
Un Angular standalone component che appartiene a `@dragone/ui`. Combina una Primitive con lo stile Sirio e la surface API Dragone. Ogni Component vive in una propria directory e viene distribuito come secondary entry point.
_Avoid_: widget, elemento, blocco

**Primitive**:
Una direttiva o componente headless di `ng-primitives` che gestisce comportamento, accessibilità e state management. I Component di Dragone compongono Primitive tramite `hostDirectives` anziché reimplementarne la logica.
_Avoid_: base component, core component, ng-primitives component

**Secondary Entry Point**:
Un punto di ingresso indipendente della libreria (`@dragone/ui/<name>`), configurato tramite `ng-package.json`. Permette tree-shaking a livello di componente singolo.
_Avoid_: subpackage, modulo, submodulo

**Attribute Selector**:
Selettore Angular del tipo `nativeElement[drgnDirective]` (es. `button[drgnButton]`). Si usa quando il Component non ha bisogno di un template proprio e potenzia un elemento HTML nativo.
_Avoid_: directive selector (è comunque un Component, non una Directive)

**Element Selector**:
Selettore Angular del tipo `drgn-name` (es. `drgn-select`). Si usa quando il Component richiede un template non triviale o sostituisce completamente il comportamento dell'elemento nativo.
_Avoid_: custom element, web component

**Token**:
Variabile CSS definita in `projects/dragone/ui/src/tokens.css`. Unico modo ammesso per esprimere valori di stile nei Component. Organizzati su tre livelli: Global (primitivi, non usare), Alias (semantici, preferire), Specific (contestuali).
_Avoid_: variabile CSS (generico), design token (usa semplicemente "token")

## Example dialogue

> **Dev**: Devo creare il componente Radio — uso `drgn-radio` o `input[drgnRadio]`?
>
> **Domain expert**: Dipende dal template. Se puoi appoggiarti alla Primitiva `NgpRadio` di ng-primitives senza un template elaborato, usa l'Attribute Selector su `input`. Se il visual custom richiede elementi aggiuntivi nel DOM (icone, label animate), vai con Element Selector.
>
> **Dev**: E per lo state, uso un signal mio o la Primitiva?
>
> **Domain expert**: Prima consulta ng-primitives MCP — se esiste `injectRadioState()`, quella è la fonte di verità. Il Component Dragone si limita a leggere quello state e a proiettarlo nei data-attributes per lo styling.
