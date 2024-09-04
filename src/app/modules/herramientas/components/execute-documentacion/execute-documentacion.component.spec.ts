import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecuteDocumentacionComponent } from './execute-documentacion.component'; 
describe('ExecuteDocumentacionComponent', () => { 
  let component: ExecuteDocumentacionComponent; 
  let fixture: ComponentFixture<ExecuteDocumentacionComponent>; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecuteDocumentacionComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecuteDocumentacionComponent); 
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
