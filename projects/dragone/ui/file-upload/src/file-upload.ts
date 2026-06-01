import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowUp } from '@ng-icons/font-awesome/solid';
import { NgpFileUpload } from 'ng-primitives/file-upload';

import { Button } from '@dragone/ui/button';
import { ChipInput } from '@dragone/ui/chip';
import { toElement } from '@dragone/ui/utils';

import { AriaLabelPipe } from './helpers/aria-label-pipe';
import { FocusElement } from './helpers/focus-element';
import { FocusManager } from './helpers/focus-manager';

type FileUploadValue = File | File[];

/**
 * Form control per upload file con supporto single/multiple, annuncio ARIA e rendering chip.
 *
 * La gestione del focus post-rimozione e' delegata alle direttive in `helpers/`.
 */
@Component({
  selector: 'drgn-file-upload',
  imports: [Button, NgIcon, NgpFileUpload, ChipInput, AriaLabelPipe, FocusManager, FocusElement],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.css',
  providers: [provideIcons({ faSolidArrowUp })],
  host: {
    '[attr.name]': 'name() ? name() : null',
    '[attr.hidden]': 'hidden() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
})
export class FileUpload implements FormValueControl<FileUploadValue | null> {
  readonly value = model<FileUploadValue | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly dragpDrop = input(true, { transform: booleanAttribute });
  readonly name = input('');
  readonly fileTypes = input<string[]>([]);
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly fileUploader = viewChild.required(Button, { read: ElementRef });
  readonly touch = output<void>();
  readonly #liveAnnouncer = inject(LiveAnnouncer);

  /** Espone sempre un array per semplificare il template `@for`. */
  filesTemplate = computed((files = this.value()) => {
    if (!files) return [];
    return Array.isArray(files) ? files : [files];
  });

  /** Focus programmatico richiesto dal contratto `FormValueControl`. */
  focus(options?: FocusOptions): void {
    toElement<HTMLButtonElement>(this.fileUploader)?.focus(options);
  }

  /** Handler per la selezione file emessa da `ngpFileUpload`. */
  protected filesSelected(files: FileList | null): void {
    if (this.disabled()) return;

    if (!files) {
      this.value.set(null);
      return;
    }

    if (!this.multiple()) {
      this.handleSingleFileSelection(files);
    } else {
      const selectedFiles = Array.from(files);
      this.value.set(selectedFiles);
      this.announceSelectedFiles(selectedFiles);
    }
  }

  /** Rimuove un file dal value corrente (single o multiple mode). */
  protected removeFile(fileToRemove: File): void {
    if (this.disabled()) return;

    const currentValue = this.value();

    if (!currentValue) return;

    if (!Array.isArray(currentValue)) {
      this.removeSingleFile(fileToRemove);
      return;
    }

    this.removeFromMultipleFiles(currentValue, fileToRemove);
  }

  /** Annuncia aggiornamenti dinamici alla tecnologia assistiva. */
  private announce(message: string): void {
    this.#liveAnnouncer.announce(message);
  }

  /** Messaggio dedicato per bulk upload in modalita' multiple. */
  private announceSelectedFiles(selectedFiles: File[]): void {
    if (selectedFiles.length === 1) {
      this.announce(`File added: ${selectedFiles[0]?.name ?? ''}`);
      return;
    }

    this.announce(`${selectedFiles.length} files added`);
  }

  /** Selezione singola: mantiene solo il primo file della lista ricevuta. */
  private handleSingleFileSelection(files: FileList): void {
    const file = files.item(0);

    if (!file) return;

    this.value.set(file);
    this.announce(`File added: ${file.name}`);
  }

  /** Rimozione in modalita' single file. */
  private removeSingleFile(fileToRemove: File): void {
    this.value.set(null);
    this.announce(`File removed: ${fileToRemove.name}`);
  }

  /** Rimozione in modalita' multiple files. */
  private removeFromMultipleFiles(files: File[], fileToRemove: File): void {
    const nextValue = files.filter(file => file !== fileToRemove);

    this.value.set(nextValue.length ? nextValue : null);
    this.announce(`File removed: ${fileToRemove.name}`);
  }
}
