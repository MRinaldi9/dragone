import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { disabled, form, FormField } from '@angular/forms/signals';
import { render } from '@wismaz/vitest-browser-angular';

import { FileUpload } from './file-upload';

const createFile = (name: string, content = 'content', type = 'text/plain'): File =>
  new File([content], name, { type, lastModified: 123 });

const createFileList = (...files: File[]): FileList => {
  const dataTransfer = new DataTransfer();

  for (const file of files) {
    dataTransfer.items.add(file);
  }

  return dataTransfer.files;
};

describe('file upload with signal forms', () => {
  const liveAnnouncer = {
    announce: vi.fn<(message: string) => Promise<void>>(),
  };

  @Component({
    imports: [FileUpload, FormField],
    template: `<drgn-file-upload [formField]="form.attachments" />`,
  })
  class SignalFormHost {
    readonly isDisabled = signal(false);
    readonly model = signal<{ attachments: File | File[] | null }>({ attachments: null });
    readonly form = form(this.model, path => {
      disabled(path.attachments, { when: () => this.isDisabled() });
    });
    readonly fileUpload = viewChild.required(FileUpload);
  }

  const renderHost = () =>
    render(SignalFormHost, {
      providers: [{ provide: LiveAnnouncer, useValue: liveAnnouncer }],
    });

  afterEach(() => {
    vi.restoreAllMocks();
    liveAnnouncer.announce.mockReset();
  });

  it('should sync the form field value to the component', async () => {
    const { fixture, componentClassInstance: host } = await renderHost();
    const file = createFile('report.pdf');

    host.form.attachments().value.set(file);
    await fixture.whenStable();

    expect(host.fileUpload().value()).toBe(file);
  });

  it('should update the form field when a file is selected', async () => {
    const { componentClassInstance: host } = await renderHost();
    const file = createFile('report.pdf');

    host.fileUpload()['filesSelected'](createFileList(file));

    expect(host.form.attachments().value()).toBe(file);
  });

  it('should disable the component when the field is disabled', async () => {
    const { fixture, componentClassInstance: host } = await renderHost();
    const existing = createFile('existing.pdf');
    host.fileUpload().value.set(existing);

    host.isDisabled.set(true);
    await fixture.whenStable();

    expect(host.fileUpload().disabled()).toBeTruthy();

    host.fileUpload()['filesSelected'](createFileList(createFile('next.pdf')));

    expect(host.fileUpload().value()).toBe(existing);
  });

  it('should mark the field touched when the component emits touch', async () => {
    const { componentClassInstance: host } = await renderHost();

    host.fileUpload().touch.emit();

    expect(host.form.attachments().touched()).toBeTruthy();
  });
});

describe('file upload with reactive forms', () => {
  const liveAnnouncer = {
    announce: vi.fn<(message: string) => Promise<void>>(),
  };

  @Component({
    imports: [FileUpload, ReactiveFormsModule],
    template: `
      <form [formGroup]="formGroup">
        <drgn-file-upload formControlName="attachments" />
      </form>
    `,
  })
  class ReactiveFormHost {
    readonly formGroup = new FormGroup({
      attachments: new FormControl<File | File[] | null>(null),
    });
    readonly fileUpload = viewChild.required(FileUpload);
  }

  const renderHost = () =>
    render(ReactiveFormHost, {
      providers: [{ provide: LiveAnnouncer, useValue: liveAnnouncer }],
    });

  afterEach(() => {
    vi.restoreAllMocks();
    liveAnnouncer.announce.mockReset();
  });

  it('should sync the form control value to the component', async () => {
    const { fixture, componentClassInstance: host } = await renderHost();
    const file = createFile('report.pdf');

    host.formGroup.controls.attachments.setValue(file);
    await fixture.whenStable();

    expect(host.fileUpload().value()).toBe(file);
  });

  it('should update the form control when a file is selected', async () => {
    const { componentClassInstance: host } = await renderHost();
    const file = createFile('report.pdf');

    host.fileUpload()['filesSelected'](createFileList(file));

    expect(host.formGroup.controls.attachments.value).toBe(file);
  });

  it('should disable the component when the form control is disabled', async () => {
    const { fixture, componentClassInstance: host } = await renderHost();
    const existing = createFile('existing.pdf');
    host.fileUpload().value.set(existing);

    host.formGroup.controls.attachments.disable();
    await fixture.whenStable();

    expect(host.fileUpload().disabled()).toBeTruthy();

    host.fileUpload()['filesSelected'](createFileList(createFile('next.pdf')));

    expect(host.fileUpload().value()).toBe(existing);
  });

  it('should mark the control touched when the component emits touch', async () => {
    const { componentClassInstance: host } = await renderHost();

    host.fileUpload().touch.emit();

    expect(host.formGroup.controls.attachments.touched).toBeTruthy();
  });
});
