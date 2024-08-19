import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfToCsvFormComponent } from './pdf-to-csv-form.component';

describe('PdfToCsvFormComponent', () => {
  let component: PdfToCsvFormComponent;
  let fixture: ComponentFixture<PdfToCsvFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfToCsvFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfToCsvFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
