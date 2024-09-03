import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateCodeComponent } from './rate-code.component';

describe('RateCodeComponent', () => {
  let component: RateCodeComponent;
  let fixture: ComponentFixture<RateCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
