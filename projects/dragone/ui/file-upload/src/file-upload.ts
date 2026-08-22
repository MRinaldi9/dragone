import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFolderOpen } from '@ng-icons/font-awesome/solid';
import { NgpFileUpload } from 'ng-primitives/file-upload';

import { Button } from '@dragone/ui/button';
import { ChipInput } from '@dragone/ui/chip';
import { Announcer, injectAnnouncerState, toElement } from '@dragone/ui/utils';

import { AriaLabelPipe } from './helpers/aria-label-pipe';
import { FocusElement } from './helpers/focus-element';
import { FocusManager } from './helpers/focus-manager';

export type FileUploadValue = File | File[];

const defaultFileAdded = (file: File): string => `File added: ${file.name}`;
const defaultFileRemoved = (file: File): string => `File removed: ${file.name}`;

@Component({
  selector: 'drgn-file-upload',
  imports: [Button, NgIcon, NgpFileUpload, ChipInput, AriaLabelPipe, FocusManager, FocusElement],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.css',
  providers: [provideIcons({ faSolidFolderOpen })],
  host: {
    '[attr.name]': 'name() ? name() : null',
    '[attr.hidden]': 'hidden() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
  hostDirectives: [Announcer],
})
export class FileUpload implements FormValueControl<FileUploadValue | null> {
  readonly value = model<FileUploadValue | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Enable drag & drop support for file upload.
   * @default true
   */
  readonly dragDrop = input(true, { transform: booleanAttribute });
  readonly name = input('');
  /**
   * The accepted file types.
   * Accepted types can either be file extensions (e.g. `.jpg`) or MIME types (e.g. `image/jpeg`).
   * */
  readonly fileTypes = input<string[]>([]);
  readonly hidden = input(false, { transform: booleanAttribute });
  /** Text to announce for when a file is added. */
  readonly fileAddedAnnouncer = input<(file: File) => string>(defaultFileAdded);
  /** Text to announce for when a file is removed. */
  readonly fileRemovedAnnouncer = input<(file: File) => string>(defaultFileRemoved);
  protected readonly fileUploader = viewChild.required(Button, { read: ElementRef });
  readonly touch = output<void>();
  readonly #announcer = injectAnnouncerState();

  protected readonly filesTemplate = computed((files = this.value()) => {
    if (!files) return [];
    return Array.isArray(files) ? files : [files];
  });

  focus(options?: FocusOptions): void {
    toElement<HTMLButtonElement>(this.fileUploader)?.focus(options);
  }

  protected filesSelected(files: FileList | null): void {
    if (this.disabled()) return;

    if (!files) {
      this.value.set(null);
      return;
    }

    if (!this.multiple()) {
      this.#handleSingleFileSelection(files);
    } else {
      const selectedFiles = Array.from(files);
      this.value.set(selectedFiles);
      this.#announcer().announceSequence(
        selectedFiles.map(file => this.fileAddedAnnouncer()(file)),
      );
    }
  }

  protected removeFile(fileToRemove: File): void {
    if (this.disabled()) return;

    const currentValue = this.value();

    if (!currentValue) return;

    if (!Array.isArray(currentValue)) {
      this.#removeSingleFile(fileToRemove);
      return;
    }

    this.#removeFromMultipleFiles(currentValue, fileToRemove);
  }

  #handleSingleFileSelection(files: FileList): void {
    const file = files.item(0);

    if (!file) return;

    this.value.set(file);
    this.#announcer().announce(this.fileAddedAnnouncer()(file));
  }

  #removeSingleFile(fileToRemove: File): void {
    this.value.set(null);
    this.#announcer().announce(this.fileRemovedAnnouncer()(fileToRemove));
  }

  #removeFromMultipleFiles(files: File[], fileToRemove: File): void {
    const nextValue = files.filter(file => file !== fileToRemove);

    this.value.set(nextValue.length ? nextValue : null);
    this.#announcer().announce(this.fileRemovedAnnouncer()(fileToRemove));
  }
}
