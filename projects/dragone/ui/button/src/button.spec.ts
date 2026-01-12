import { ChangeDetectionStrategy, Component, inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { Button, ButtonSize, ButtonVariant } from './button';

@Component({
  imports: [Button],
  template: `
    <button
      drgnButton
      [variant]="variant()"
      [size]="size()"
      [icon]="isIconOnly()"
      [disabled]="isDisabled()"
    >
      Dragone
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  variant = signal<ButtonVariant>('primary');
  size = signal<ButtonSize>('large');
  isIconOnly = signal(false);
  isDisabled = signal(false);
}

describe(Button.name, () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;
  const size = signal<ButtonSize>('large');
  const isIconOnly = signal<boolean>(false);
  const variant = signal<ButtonVariant>('primary');
  const isDisabled = signal<boolean>(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Button, {
      inferTagName: true,
      bindings: [
        inputBinding('size', size),
        inputBinding('icon', isIconOnly),
        inputBinding('variant', variant),
        inputBinding('disabled', isDisabled),
      ],
    });
    component = fixture.componentInstance;
  });

  afterEach(() => {
    size.set('large');
    isIconOnly.set(false);
    variant.set('primary');
    isDisabled.set(false);
  });

  it('should create and default property', () => {
    expect(component).toBeTruthy();
    expect(component.size()).toBe('large');
    expect(component.isIconOnly()).toBe(false);
    expect(component.variant()).toBe('primary');
  });
  describe('Test Inputs', () => {
    let fixtureHost: ComponentFixture<TestHostComponent>;
    it('should change size', async () => {
      size.set('medium');
      await fixture.whenStable();
      expect(component.size()).toBe('medium');
      const btnHtml = page.getByRole('button');
      await expect.element(btnHtml).toHaveAttribute('data-size', 'medium');
    });
    it('should change isIconOnly', async () => {
      isIconOnly.set(true);
      await fixture.whenStable();
      expect(component.isIconOnly()).toBe(true);
    });
    it('should change variant', async () => {
      variant.set('danger');
      await fixture.whenStable();
      expect(component.variant()).toBe('danger');
    });
    it('should change disabled', async () => {
      fixtureHost = TestBed.createComponent(TestHostComponent);
      const comp = fixtureHost.componentInstance;
      comp.isDisabled.set(true);
      await fixtureHost.whenStable();
      const btnHtml = page.getByRole('button');
      await expect.element(btnHtml).toBeDisabled();
      await expect.element(btnHtml).toHaveAttribute('data-disabled');
    });
  });
  describe('Test outputs', () => {
    it('should emit native event', () => {
      const clickSpy = vi.fn();
      fixture.nativeElement.addEventListener('click', clickSpy);
      fixture.nativeElement.click();
      expect(clickSpy).toHaveBeenCalled();
      fixture.nativeElement.removeEventListener('click', clickSpy);
    });
  });
});
