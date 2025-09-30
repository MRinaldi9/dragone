# Istruzioni per GitHub Copilot

## Contesto del Progetto

Questo è un monorepo Angular gestito con `pnpm`. Il progetto principale è una libreria di componenti UI riutilizzabili chiamata `@dragone/ui`, che si trova in `projects/dragone/ui`.

L'obiettivo è costruire un design system robusto e coerente. Quando generi nuovi componenti, fai riferimento a questa libreria.

## Convenzioni Chiave

### 1. Struttura e Nomenclatura dei Componenti
- **Progetto Libreria**: La libreria sfrutta il concetto dei secondary entry points, quindi ogni componente deve essere creato come un entry point secondario (es. `projects/dragone/ui/button`).
- **Prefisso**: Utilizza il prefisso `drgn` per tutti i selettori dei componenti (es. `<drgn-button>`). Questo è definito in `angular.json`.
- **File dei Componenti**: I componenti di default sono *standalone*. Ogni componente dovrebbe avere i propri file `.ts`, `.html`, `.css` e `.spec.ts`.
- **Template**: I componenti devono essere dichiarati con template inline al @Component, a meno che non superino piu' di 10-15 righe di codice, altrimenti devono essere spostati in un file separato `<nomeComponente>.html`.

### 2. Stili e Design Tokens
- **Fonte di Verità**: Lo stile dei componenti si basa sul file di design tokens che si trova in `projects/dragone/ui/src/tokens.css`. **Tutto lo stile deve usare queste variabili CSS**, non valori hard-coded.
- **Logica dei Token**: I token seguono una gerarchia a 3 livelli:
    1.  **Global**: Valori primitivi (es. `--color-global-primary-100: #2f6dd5;`). Non usare mai questi token direttamente nei componenti.
    2.  **Alias**: Nomi semantici per contesti di utilizzo (es. `--interactive-primary-default: var(--color-global-primary-100);`). Usa questi token il più possibile.
    3.  **Specific**: Token per un singolo componente (raro, da usare solo se un alias non è sufficiente).
- **Stili Globali**: Non ci sono stili globali. Ogni componente è incapsulato e autonomo.

### 3. Pattern di Implementazione dei Componenti
- **Stato di Focus (`focus-visible`)**: Per gestire lo stato di focus, non usare `outline`. Usa una `box-shadow` a più livelli per creare un anello di focus personalizzato, come implementato nel componente bottone.
- **Variante Icon-Only (CSS-only)**: Per componenti come i bottoni che possono contenere solo un'icona, usa il pattern CSS-only per rilevarlo. Questo richiede di avvolgere il testo proiettato (`<ng-content>`) in uno `<span>` (es. `<span class="drgn-button-label">...</span>`) e usare selettori CSS come `:has()` e `:empty` per applicare stili specifici quando quel `<span>` è vuoto.

### 4. Sviluppo e Test con Storybook
- **Ambiente di Sviluppo**: Storybook è lo strumento principale per sviluppare, visualizzare e testare i componenti in isolamento.
- **Scrittura delle Stories**: Ogni componente deve avere un file `.stories.ts`.
- **Test di Interazione**: Usa le `play` function di Storybook per testare interazioni com'plesse. Per emulare il `focus-visible`, usa `userEvent.tab()` dalla libreria `@storybook/test` per simulare la navigazione da tastiera.

## Workflow di Sviluppo

### 1. Gestione delle Dipendenze
- Usa sempre `pnpm` per installare, aggiornare o rimuovere le dipendenze. Ad esempio: `pnpm add <package-name>`.

### 2. Comandi Principali
- **Avviare Storybook**: `pnpm storybook`
- **Costruire la libreria**: `pnpm build @dragone/ui`
- **Eseguire i test**: `pnpm test`
- **Linting e Formattazione**:
  - Il linting viene eseguito con `pnpm lint`.
  - La formattazione del codice con Prettier viene eseguita con `pnpm format`.
  - Entrambi i comandi vengono eseguiti automaticamente prima di ogni commit tramite `lefthook` (vedi `lefthook.yml`).

### 3. Commit
- I messaggi di commit devono seguire lo standard **Conventional Commits**.
- Un hook `prepare-commit-msg` avvierà un prompt interattivo (`pnpm cz`) per aiutarti a formattare correttamente il messaggio di commit.
- `commitlint` (configurato in `commitlint.config.mjs`) valida il messaggio prima che il commit venga finalizzato.

## Esempio di Creazione di un Componente

Per creare un nuovo componente `button` nella libreria `@dragone/ui`:

```bash
ng g c button --project=@dragone/ui --flat --path projects/dragone/ui/button/src
```
Successivamente, crea il file `button.stories.ts` e sviluppa il componente usando Storybook, seguendo i pattern di implementazione e stile definiti sopra.

