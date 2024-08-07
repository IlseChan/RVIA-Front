import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSanitizeComponent } from './form-sanitize.component';

describe('FormSanitizeComponent', () => {
  let component: FormSanitizeComponent;
  let fixture: ComponentFixture<FormSanitizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSanitizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSanitizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
