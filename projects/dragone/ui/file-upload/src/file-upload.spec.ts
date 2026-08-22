import { LiveAnnouncer } from '@angular/cdk/a11y';
import { signal, type Signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { userEvent } from 'vitest/browser';

import { setUpFastForward } from '@dragone/ui/tests/setup-timer-mode';

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

type FileAnnouncer = (file: File) => string;

describe(FileUpload, () => {
  const liveAnnouncer = {
    announce: vi.fn<(message: string) => Promise<void>>(),
  };

  const multiple = signal(false);
  const disabled = signal(false);

  const renderFileUpload = (
    inputs: {
      fileAddedAnnouncer?: FileAnnouncer | Signal<FileAnnouncer>;
      fileRemovedAnnouncer?: FileAnnouncer | Signal<FileAnnouncer>;
    } = {},
  ) =>
    render(FileUpload, {
      inputs: { multiple, disabled, ...inputs },
      providers: [{ provide: LiveAnnouncer, useValue: liveAnnouncer }],
    });

  afterEach(() => {
    vi.restoreAllMocks();
    liveAnnouncer.announce.mockReset();
    multiple.set(false);
    disabled.set(false);
  });

  it('should create', async () => {
    const { componentClassInstance: component } = await renderFileUpload();

    expect(component).toBeTruthy();
  });

  it('should select the first file in single mode and announce it', async () => {
    const { componentClassInstance: component } = await renderFileUpload();
    const report = createFile('report.pdf');
    const ignored = createFile('ignored.pdf');

    component['filesSelected'](createFileList(report, ignored));

    expect(component.value()).toBe(report);
    expect(component['filesTemplate']()).toEqual([report]);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File added: report.pdf');
  });

  it('should clear the value when file selection is null', async () => {
    const { componentClassInstance: component } = await renderFileUpload();
    component.value.set(createFile('existing.pdf'));

    component['filesSelected'](null);

    expect(component.value()).toBeNull();
    expect(liveAnnouncer.announce).not.toHaveBeenCalled();
  });

  it('should announce each selected file in multiple mode, spaced by a delay', async () => {
    setUpFastForward();
    const { fixture, componentClassInstance: component } = await renderFileUpload();
    const first = createFile('first.pdf');
    const second = createFile('second.pdf');

    multiple.set(true);
    await fixture.whenStable();
    component['filesSelected'](createFileList(first, second));

    expect(component.value()).toEqual([first, second]);
    expect(component['filesTemplate']()).toEqual([first, second]);
    expect(liveAnnouncer.announce).toHaveBeenCalledOnce();
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File added: first.pdf');

    // Fast-forward through the delay between announcements.
    await vi.runAllTimersAsync();

    expect(liveAnnouncer.announce).toHaveBeenCalledTimes(2);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File added: second.pdf');
  });

  it('should cancel the previous announcement sequence when files are selected again', async () => {
    setUpFastForward();
    const { fixture, componentClassInstance: component } = await renderFileUpload();
    const first = createFile('first.pdf');
    const second = createFile('second.pdf');
    const third = createFile('third.pdf');

    multiple.set(true);
    await fixture.whenStable();
    component['filesSelected'](createFileList(first, second));
    component['filesSelected'](createFileList(third));

    expect(liveAnnouncer.announce).toHaveBeenCalledTimes(2);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File added: first.pdf');
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File added: third.pdf');

    await vi.runAllTimersAsync();

    expect(liveAnnouncer.announce).toHaveBeenCalledTimes(2);
    expect(liveAnnouncer.announce).not.toHaveBeenCalledWith('File added: second.pdf');
  });

  it('should announce the file name in multiple mode when one file is selected', async () => {
    const { fixture, componentClassInstance: component } = await renderFileUpload();
    multiple.set(true);
    await fixture.whenStable();
    const invoice = createFile('invoice.pdf');

    component['filesSelected'](createFileList(invoice));

    expect(component.value()).toEqual([invoice]);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File added: invoice.pdf');
  });

  it('should use a custom file added announcer for single selection', async () => {
    const fileAddedAnnouncer = vi.fn<FileAnnouncer>(file => `Aggiunto: ${file.name}`);
    const { componentClassInstance: component } = await renderFileUpload({ fileAddedAnnouncer });
    const report = createFile('report.pdf');

    component['filesSelected'](createFileList(report));

    expect(fileAddedAnnouncer).toHaveBeenCalledWith(report);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Aggiunto: report.pdf');
  });

  it('should use a custom file added announcer for each file in multiple mode', async () => {
    setUpFastForward();
    const fileAddedAnnouncer = vi.fn<FileAnnouncer>(file => `Aggiunto: ${file.name}`);
    const { fixture, componentClassInstance: component } = await renderFileUpload({
      fileAddedAnnouncer,
    });
    const first = createFile('first.pdf');
    const second = createFile('second.pdf');

    multiple.set(true);
    await fixture.whenStable();
    component['filesSelected'](createFileList(first, second));

    expect(fileAddedAnnouncer).toHaveBeenNthCalledWith(1, first);
    expect(fileAddedAnnouncer).toHaveBeenNthCalledWith(2, second);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Aggiunto: first.pdf');

    await vi.runAllTimersAsync();

    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Aggiunto: second.pdf');
  });

  it('should use a custom file removed announcer when removing a single file', async () => {
    const fileRemovedAnnouncer = vi.fn<FileAnnouncer>(file => `Rimosso: ${file.name}`);
    const { componentClassInstance: component } = await renderFileUpload({ fileRemovedAnnouncer });
    const file = createFile('resume.pdf');
    component.value.set(file);

    component['removeFile'](file);

    expect(fileRemovedAnnouncer).toHaveBeenCalledWith(file);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Rimosso: resume.pdf');
  });

  it('should use a custom file removed announcer when removing from multiple files', async () => {
    const fileRemovedAnnouncer = vi.fn<FileAnnouncer>(file => `Rimosso: ${file.name}`);
    const { componentClassInstance: component } = await renderFileUpload({ fileRemovedAnnouncer });
    const first = createFile('first.pdf');
    const second = createFile('second.pdf');
    component.value.set([first, second]);

    component['removeFile'](first);

    expect(fileRemovedAnnouncer).toHaveBeenCalledWith(first);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Rimosso: first.pdf');
  });

  it('should react to a changed file added announcer', async () => {
    const fileAddedAnnouncer = signal<FileAnnouncer>(file => `Primo: ${file.name}`);
    const { fixture, componentClassInstance: component } = await renderFileUpload({
      fileAddedAnnouncer,
    });
    const report = createFile('report.pdf');

    fileAddedAnnouncer.set(file => `Secondo: ${file.name}`);
    await fixture.whenStable();

    component['filesSelected'](createFileList(report));

    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Secondo: report.pdf');
  });

  it('should ignore selection changes when disabled', async () => {
    const { fixture, componentClassInstance: component } = await renderFileUpload();
    const existing = createFile('existing.pdf');
    const next = createFile('next.pdf');
    component.value.set(existing);
    disabled.set(true);
    await fixture.whenStable();

    component['filesSelected'](createFileList(next));

    expect(component.value()).toBe(existing);
    expect(liveAnnouncer.announce).not.toHaveBeenCalled();
  });

  it('should remove a single selected file and announce it', async () => {
    const { componentClassInstance: component } = await renderFileUpload();
    const file = createFile('resume.pdf');
    component.value.set(file);

    component['removeFile'](file);

    expect(component.value()).toBeNull();
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File removed: resume.pdf');
  });

  it('should remove one file from multiple mode and keep the others', async () => {
    const { componentClassInstance: component } = await renderFileUpload();
    const first = createFile('first.pdf');
    const second = createFile('second.pdf');
    component.value.set([first, second]);

    component['removeFile'](first);

    expect(component.value()).toEqual([second]);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File removed: first.pdf');
  });

  it('should clear multiple mode when removing the last file', async () => {
    const { componentClassInstance: component } = await renderFileUpload();
    const onlyFile = createFile('only.pdf');
    component.value.set([onlyFile]);

    component['removeFile'](onlyFile);

    expect(component.value()).toBeNull();
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File removed: only.pdf');
  });

  it('should ignore removal when disabled', async () => {
    const { fixture, componentClassInstance: component } = await renderFileUpload();
    const file = createFile('locked.pdf');
    component.value.set(file);
    disabled.set(true);
    await fixture.whenStable();

    component['removeFile'](file);

    expect(component.value()).toBe(file);
    expect(liveAnnouncer.announce).not.toHaveBeenCalled();
  });

  it('should focus the upload button via the form control contract', async () => {
    const { baseElement, componentClassInstance: component } = await renderFileUpload();
    const button = baseElement.querySelector('button') as HTMLButtonElement;
    const focusSpy = vi.spyOn(button, 'focus');

    component.focus({ preventScroll: true });

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should emit touch when the upload button blurs', async () => {
    const {
      baseElement,
      fixture,
      locator,
      componentClassInstance: component,
    } = await renderFileUpload();
    const touchSpy = vi.fn<() => void>();
    component.touch.subscribe(touchSpy);

    await userEvent.click(locator.getByRole('button'));
    await fixture.whenStable();

    baseElement.querySelector('button')?.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(touchSpy).toHaveBeenCalledOnce();
  });

  it('should remove a rendered chip when its remove button is clicked', async () => {
    const { fixture, locator, componentClassInstance: component } = await renderFileUpload();
    multiple.set(true);
    const report = createFile('report.pdf');
    component.value.set([report]);
    await fixture.whenStable();

    await userEvent.click(locator.getByRole('button', { name: 'Remove file report.pdf' }));
    await fixture.whenStable();

    expect(component.value()).toBeNull();
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File removed: report.pdf');
  });
});
