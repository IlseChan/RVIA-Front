import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCsvComponent } from './form-csv.component';

describe('FormCsvComponent', () => {
  let component: FormCsvComponent;
  let fixture: ComponentFixture<FormCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCsvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
