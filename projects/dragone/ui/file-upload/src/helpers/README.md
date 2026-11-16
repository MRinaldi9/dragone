# File Upload Helpers

Questa cartella contiene le direttive che isolano la logica di focus dal componente `FileUpload`.

## Obiettivo

Separare responsabilita':

- `FileUpload` gestisce stato file + annunci ARIA.
- Le direttive helper gestiscono solo il comportamento di focus in lista.

## FocusManager (`focus-manager.ts`)

Direttiva applicata al contenitore lista:

- Selector: `ul[drgnFocusManager]`
- Export: `focusManager`
- Input: `fallbackElement` (tipicamente il bottone Upload)

API pubblica:

- `register(filename, button)`: registra un bottone chip nel manager.
- `unregister(filename)`: rimuove la registrazione quando il chip esce dal DOM.
- `focusNext(filename)`: prova a mettere focus su elemento successivo;
  se non disponibile, sul precedente;
  fallback finale su `fallbackElement`.

Nota: nel template viene chiamato su `animate.leave`, quindi la classe di uscita e il timing della rimozione sono gia' allineati con il flusso UX.

## FocusElement (`focus-element.ts`)

Direttiva ponte applicata al singolo chip:

- Selector: `[drgnFocusElement]`
- Export: `focusElement`
- Input richiesto: `drgnFocusElement` (chiave stabile, attualmente il filename)

Ciclo vita:

1. `ngOnInit`: trova il bottone interno del chip e lo registra nel manager.
2. `ngOnDestroy`: deregistra la chiave dal manager.

## Esempio d'uso nel template

```html
<ul #focusManager="focusManager" drgnFocusManager [fallbackElement]="fileUploader()">
  @for (file of files; track file) {
    @let uniqueName = `${file.name}:${file.size}:${file.lastModified}`;
    <li
      #liElement
      animate.enter="file-item-enter"
      [drgnFocusElement]="uniqueName"
      (animate.leave)="liElement.classList.add('file-item-leave'); focusManager.focusNext(uniqueName)"
    >
      <drgn-chip-input (remove)="removeFile(file)" />
    </li>
  }
</ul>
```
