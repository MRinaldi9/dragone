import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { page, userEvent } from 'vitest/browser';

import { ChipSelected } from './chip-selected';

describe(ChipSelected, () => {
  describe('standalone behavior', () => {
    @Component({
      imports: [ChipSelected],
      template: `
        <button
          drgn-chip-selected
          [selected]="selected()"
          [disabled]="disabled()"
          (selectedChange)="onChange($event)"
        >
          Test
        </button>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TestHostComponent {
      selected = signal(false);
      disabled = signal(false);
      onChange = vi.fn<() => void>();
    }
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [TestHostComponent],
      });

      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      await fixture.whenStable();
    });

    it('should default to unselected', () => {
      const button = page.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should toggle selected state on click', async () => {
      const button = page.getByRole('button');
      await button.click();
      expect(component.onChange).toHaveBeenCalledWith(true);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should reflect disabled state', async () => {
      const button = page.getByRole('button');
      component.disabled.set(true);
      await fixture.whenStable();
      expect(button).toBeDisabled();
    });
    it('should reflect selected state from parent', async () => {
      const button = page.getByRole('button');
      component.selected.set(true);
      await fixture.whenStable();
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
    it('should not toggle when disabled', async () => {
      const button = page.getByRole('button');
      component.disabled.set(true);
      await fixture.whenStable();

      expect(component.onChange).not.toHaveBeenCalled();
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('forms integrations', () => {
    @Component({
      imports: [ChipSelected, ReactiveFormsModule],
      template: ` <button drgn-chip-selected [formControl]="fcontrol">Test</button> `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TestHostFormComponent {
      fcontrol = new FormControl(false, { nonNullable: true });
    }
    let component: TestHostFormComponent;
    let fixture: ComponentFixture<TestHostFormComponent>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [TestHostFormComponent],
      });

      fixture = TestBed.createComponent(TestHostFormComponent);
      component = fixture.componentInstance;
      await fixture.whenStable();
    });
    it('should toggle selected state on click', async () => {
      const button = page.getByRole('button');
      await button.click();
      expect(component.fcontrol.value).toBeTruthy();
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
    it('should reflect form control value', async () => {
      const button = page.getByRole('button');
      component.fcontrol.setValue(true);
      await fixture.whenStable();
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
    it('should disable when form control is disabled', async () => {
      const button = page.getByRole('button');
      component.fcontrol.disable();
      await fixture.whenStable();
      expect(button).toBeDisabled();
    });
    it('should trigger touched state on blur', async () => {
      expect(component.fcontrol.touched).toBeFalsy();
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('{Tab}');
      expect(component.fcontrol.touched).toBeTruthy();
    });
  });
});
