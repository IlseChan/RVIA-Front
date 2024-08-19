import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecuteIaComponent } from './execute-ia.component';

describe('ExecuteIaComponent', () => {
  let component: ExecuteIaComponent;
  let fixture: ComponentFixture<ExecuteIaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecuteIaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecuteIaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
