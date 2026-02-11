import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Mock } from 'vitest';
import { Locator, page, userEvent } from 'vitest/browser';
import { TooltipTrigger } from './tooltip-trigger/tooltip-trigger';
import { Tooltip, TooltipContext } from './tooltip/tooltip';

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
  let tooltipTriggerDirective: TooltipTrigger;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
    btnToHover = await page.getByRole('button', { name: 'Hover me' });
    tooltipTriggerDirective = fixture.debugElement
      .query(By.directive(TooltipTrigger))
      .injector.get(TooltipTrigger);
  });
  it('should not display the tooltip on hover', async () => {
    component.tooltipDisabled.set(true);
    await fixture.whenStable();
    await userEvent.hover(btnToHover);
    const tooltip = await page.getByRole('tooltip');
    expect(tooltip).not.toBeInTheDocument();
    expect(tooltipTriggerDirective['stateTooltip']().context()).toBe('This is a helpful tooltip');
  });
  it('should display the tooltip on hover', async () => {
    await userEvent.hover(btnToHover);
    const tooltip = await page.getByRole('tooltip');
    const tooltipInstance = fixture.debugElement.query(By.directive(Tooltip)).injector.get(Tooltip);
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('This is a helpful tooltip');
    expect(tooltipTriggerDirective['stateTooltip']().context()).toBe('This is a helpful tooltip');
    expect(tooltipInstance['bodyTooltip']()).toBeUndefined();
  });

  it('should show title and body', async () => {
    component.tooltipContent.set({ title: 'Tooltip Title', body: 'Tooltip Body' });
    await fixture.whenStable();
    await userEvent.hover(btnToHover);
    const tooltip = await page.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Tooltip Title');
    expect(tooltip).toHaveTextContent('Tooltip Body');
    expect(tooltipTriggerDirective['stateTooltip']().context()).toEqual({
      title: 'Tooltip Title',
      body: 'Tooltip Body',
    });
  });
  it('should show total tooltip', async () => {
    component.tooltipContent.set({
      title: 'Full Tooltip',
      body: 'This is the body of the full tooltip',
      action: vi.fn(),
      actionLabel: 'Click Me',
    });
    await fixture.whenStable();
    await userEvent.hover(btnToHover);
    const tooltip = await page.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Full Tooltip');
    expect(tooltip).toHaveTextContent('This is the body of the full tooltip');
    expect(tooltip).toHaveTextContent('Click Me');
    expect(tooltipTriggerDirective['stateTooltip']().context()).toEqual({
      title: 'Full Tooltip',
      body: 'This is the body of the full tooltip',
      action: expect.any(Function),
      actionLabel: 'Click Me',
    });
    await userEvent.click(await page.getByRole('button', { name: 'Click Me' }));
    expect((component.tooltipContent() as { action: Mock }).action).toHaveBeenCalled();
  });
});
