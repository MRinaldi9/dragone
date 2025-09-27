# Istruzioni per GitHub Copilot

## Contesto del Progetto

Questo è un monorepo Angular gestito con `pnpm`. Il progetto principale è una libreria di componenti UI riutilizzabili chiamata `@dragone/ui`, che si trova in `projects/dragone/ui`.

L'obiettivo è costruire un design system robusto e coerente. Quando generi nuovi componenti, fai riferimento a questa libreria.

## Convenzioni Chiave

### 1. Struttura e Nomenclatura dei Componenti
- **Progetto Libreria**: La libreria sfrutta il concetto dei secondary entry points, quindi ogni componente deve essere creato come un entry point secondario (es. `projects/dragone/ui/button`).
- **Prefisso**: Utilizza il prefisso `drgn` per tutti i selettori dei componenti (es. `<drgn-button>`). Questo è definito in `angular.json`.
- **File dei Componenti**: I componenti di default sono *standalone*, quindi non c'e' bisogno settare `standalone: true` nel decoratore @Component. Ogni componente dovrebbe avere i propri file `.ts`, `.html`, `.css` e `.spec.ts`.
- **Template**: I componenti devono essere dichiarati con template inline al @Component, a meno che non superino piu' di 10-15 righe di codice, altrimenti devono essere spostati in un file separato <nomeComponente>.html.


### 2. Stili
- **Stili Globali**: Non ci sono stili globali. Ogni componente è incapsulato e autonomo.
- **Variabili CSS**: Se il design system ne fa uso, fai riferimento alle variabili CSS definite per colori, font, ecc.

## Workflow di Sviluppo

### 1. Gestione delle Dipendenze
- Usa sempre `pnpm` per installare, aggiornare o rimuovere le dipendenze. Ad esempio: `pnpm add <package-name>`.

### 2. Comandi Principali
- **Avviare il server di sviluppo**: `pnpm start` (esegue `ng serve`)
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

