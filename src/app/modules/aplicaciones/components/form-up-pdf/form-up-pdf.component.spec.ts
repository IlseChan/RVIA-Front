import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormUpPdfComponent } from './form-up-pdf.component';

describe('FormUpPdfComponent', () => {
  let component: FormUpPdfComponent;
  let fixture: ComponentFixture<FormUpPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormUpPdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormUpPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
