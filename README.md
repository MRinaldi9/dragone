# Dragone

La libreria Dragone nasce dal design system [Sirio](https://www.inps.design/3e7e2b0f5/p/37c451-ciao-italia) e nasce per la creazione di un set robusto e coerente di componenti UI riutilizzabili per Angular.

## 🚀 Getting Started

Per avviare il progetto sulla tua macchina locale, segui questi passaggi.

### Prerequisiti

Assicurati di avere `pnpm` installato globalmente. Se non ce l'hai, puoi installarlo con npm:

```bash
npm install -g pnpm
```

### Installazione

1.  Clona il repository:
    ```bash
    git clone <url-del-tuo-repository>
    ```
2.  Naviga nella directory del progetto:
    ```bash
    cd dragone
    ```
3.  Installa le dipendenze usando `pnpm`:
    ```bash
    pnpm install
    ```

## 💻 Workflow di Sviluppo

Questo progetto usa **Storybook** come ambiente primario per sviluppare, visualizzare e testare i componenti in isolamento.

### Avviare Storybook

Per avviare il server di sviluppo di Storybook, esegui:

```bash
pnpm storybook
```

Questo aprirà Storybook nel tuo browser, dove potrai vedere tutti i componenti della libreria `@dragone/ui`.

### Costruire la Libreria

Per creare una build di produzione della libreria `@dragone/ui`, esegui:

```bash
pnpm build @dragone/ui
```

Gli artefatti della build verranno salvati nella directory `dist/projects/dragone/ui`.

### Eseguire i Test

Per eseguire i test unitari per la libreria, esegui:

```bash
pnpm test
```

## ✨ Qualità del Codice e Convenzioni

Questo progetto applica rigide convenzioni sulla qualità del codice e sui commit per mantenere uno standard elevato.

### Linting e Formattazione

- Per eseguire il linter: `pnpm lint`
- Per formattare il codice con Prettier: `pnpm format`

Questi controlli vengono eseguiti automaticamente prima di ogni commit, grazie a `lefthook`.

### Messaggi di Commit

Tutti i messaggi di commit devono seguire lo standard [Conventional Commits](https://www.conventionalcommits.org/). Per aiutarti, un hook pre-commit avvierà automaticamente un prompt interattivo (`pnpm cz`) per guidarti nella creazione del messaggio.
