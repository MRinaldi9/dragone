import { AriaLabelPipe } from './aria-label-pipe';

describe(AriaLabelPipe, () => {
  it('should create an instance', () => {
    const pipe = new AriaLabelPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return a basic label when file name is unique', () => {
    const pipe = new AriaLabelPipe();
    const file = { name: 'report.pdf' } as File;

    expect(pipe.transform(file, [file])).toBe('Remove file report.pdf');
  });

  it('should include index and total when file name has duplicates', () => {
    const pipe = new AriaLabelPipe();
    const firstDuplicate = { name: 'image.png' } as File;
    const secondDuplicate = { name: 'image.png' } as File;

    expect(pipe.transform(firstDuplicate, [firstDuplicate, secondDuplicate])).toBe(
      'Remove file image.png (1 of 2)',
    );
    expect(pipe.transform(secondDuplicate, [firstDuplicate, secondDuplicate])).toBe(
      'Remove file image.png (2 of 2)',
    );
  });

  it('should calculate index only among files with the same name', () => {
    const pipe = new AriaLabelPipe();
    const otherFile = { name: 'notes.txt' } as File;
    const firstDuplicate = { name: 'invoice.pdf' } as File;
    const secondDuplicate = { name: 'invoice.pdf' } as File;
    const thirdDuplicate = { name: 'invoice.pdf' } as File;

    const files = [otherFile, firstDuplicate, secondDuplicate, thirdDuplicate];

    expect(pipe.transform(secondDuplicate, files)).toBe('Remove file invoice.pdf (2 of 3)');
  });
});
