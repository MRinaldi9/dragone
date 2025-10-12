import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionHeader } from './accordion-header';

// TODO Problema con providers dello stato di ng-primitives
describe.skip('AccordionHeader', () => {
  let component: AccordionHeader;
  let fixture: ComponentFixture<AccordionHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
