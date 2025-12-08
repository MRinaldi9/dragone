import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Locator, page, userEvent } from 'vitest/browser';
import { TooltipTrigger } from './tooltip-trigger/tooltip-trigger';
import { TooltipContext } from './tooltip/tooltip';

@Component({
  imports: [TooltipTrigger],
  template: `
    <button drgnTooltip [tooltipContent]="tooltipContent()" [tooltipDisabled]="tooltipDisabled()">
      Hover me
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  tooltipContent = signal<TooltipContext>('This is a helpful tooltip');
  tooltipDisabled = signal(false);
}

describe('Tooltip', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let btnToHover: Locator;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
    btnToHover = await page.getByRole('button', { name: 'Hover me' });
  });

  it('should create', async () => {
    await userEvent.hover(btnToHover);
    const tooltip = await page.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });
});
