import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputGroup } from './input-group';

describe('InputGroup', () => {
  let component: InputGroup;
  let fixture: ComponentFixture<InputGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(InputGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply error state', () => {
    fixture.componentRef.setInput('error', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.getAttribute('data-error')).toBe('true');
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.getAttribute('data-disabled')).toBe('true');
  });
});
