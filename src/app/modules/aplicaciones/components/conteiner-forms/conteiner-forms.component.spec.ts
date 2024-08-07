import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConteinerFormsComponent } from './conteiner-forms.component';

describe('ConteinerFormsComponent', () => {
  let component: ConteinerFormsComponent;
  let fixture: ComponentFixture<ConteinerFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConteinerFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConteinerFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
