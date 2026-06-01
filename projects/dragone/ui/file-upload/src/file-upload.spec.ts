import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inputBinding, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { FileUpload } from './file-upload';

describe(FileUpload, () => {
  const liveAnnouncer = {
    announce: vi.fn<(message: string) => Promise<void>>(),
  };

  let component: FileUpload;
  let fixture: ComponentFixture<FileUpload>;
  let multiple: ReturnType<typeof signal<boolean>>;
  let disabled: ReturnType<typeof signal<boolean>>;

  const createFile = (name: string, content = 'content', type = 'text/plain'): File =>
    new File([content], name, { type, lastModified: 123 });

  const createFileList = (...files: File[]): FileList => {
    const dataTransfer = new DataTransfer();

    for (const file of files) {
      dataTransfer.items.add(file);
    }

    return dataTransfer.files;
  };

  beforeEach(async () => {
    multiple = signal(false);
    disabled = signal(false);

    await TestBed.configureTestingModule({
      imports: [FileUpload],
      providers: [{ provide: LiveAnnouncer, useValue: liveAnnouncer }],
    }).compileComponents();

    fixture = TestBed.createComponent(FileUpload, {
      bindings: [inputBinding('multiple', multiple), inputBinding('disabled', disabled)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    liveAnnouncer.announce.mockReset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select the first file in single mode and announce it', () => {
    const report = createFile('report.pdf');
    const ignored = createFile('ignored.pdf');

    component['filesSelected'](createFileList(report, ignored));

    expect(component.value()).toBe(report);
    expect(component.filesTemplate()).toEqual([report]);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File added: report.pdf');
  });

  it('should clear the value when file selection is null', () => {
    component.value.set(createFile('existing.pdf'));

    component['filesSelected'](null);

    expect(component.value()).toBeNull();
    expect(liveAnnouncer.announce).not.toHaveBeenCalled();
  });

  it('should collect all files in multiple mode and announce their count', async () => {
    multiple.set(true);
    await fixture.whenStable();
    const first = createFile('first.pdf');
    const second = createFile('second.pdf');

    component['filesSelected'](createFileList(first, second));

    expect(component.value()).toEqual([first, second]);
    expect(component.filesTemplate()).toEqual([first, second]);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('2 files added');
  });

  it('should announce the file name in multiple mode when one file is selected', async () => {
    multiple.set(true);
    await fixture.whenStable();
    const invoice = createFile('invoice.pdf');

    component['filesSelected'](createFileList(invoice));

    expect(component.value()).toEqual([invoice]);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File added: invoice.pdf');
  });

  it('should ignore selection changes when disabled', async () => {
    const existing = createFile('existing.pdf');
    const next = createFile('next.pdf');
    component.value.set(existing);
    disabled.set(true);
    await fixture.whenStable();

    component['filesSelected'](createFileList(next));

    expect(component.value()).toBe(existing);
    expect(liveAnnouncer.announce).not.toHaveBeenCalled();
  });

  it('should remove a single selected file and announce it', () => {
    const file = createFile('resume.pdf');
    component.value.set(file);

    component['removeFile'](file);

    expect(component.value()).toBeNull();
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File removed: resume.pdf');
  });

  it('should remove one file from multiple mode and keep the others', () => {
    const first = createFile('first.pdf');
    const second = createFile('second.pdf');
    component.value.set([first, second]);

    component['removeFile'](first);

    expect(component.value()).toEqual([second]);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File removed: first.pdf');
  });

  it('should clear multiple mode when removing the last file', () => {
    const onlyFile = createFile('only.pdf');
    component.value.set([onlyFile]);

    component['removeFile'](onlyFile);

    expect(component.value()).toBeNull();
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File removed: only.pdf');
  });

  it('should ignore removal when disabled', async () => {
    const file = createFile('locked.pdf');
    component.value.set(file);
    disabled.set(true);
    await fixture.whenStable();

    component['removeFile'](file);

    expect(component.value()).toBe(file);
    expect(liveAnnouncer.announce).not.toHaveBeenCalled();
  });

  it('should focus the upload button via the form control contract', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const focusSpy = vi.spyOn(button, 'focus');

    component.focus({ preventScroll: true });

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should emit touch when the upload button blurs', async () => {
    const touchSpy = vi.fn<() => void>();
    component.touch.subscribe(touchSpy);

    const uploadButton = page.getByRole('button', { name: 'Upload' });
    await userEvent.click(uploadButton);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('button')?.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(touchSpy).toHaveBeenCalledTimes(1);
  });

  it('should remove a rendered chip when its remove button is clicked', async () => {
    multiple.set(true);
    const report = createFile('report.pdf');
    component.value.set([report]);
    await fixture.whenStable();

    await userEvent.click(page.getByRole('button', { name: 'Remove file report.pdf' }));
    await fixture.whenStable();

    expect(component.value()).toBeNull();
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('File removed: report.pdf');
  });
});
