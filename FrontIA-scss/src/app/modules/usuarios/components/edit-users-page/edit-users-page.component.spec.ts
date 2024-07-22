import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUsersPageComponent } from './edit-users-page.component';

describe('EditUsersPageComponent', () => {
  let component: EditUsersPageComponent;
  let fixture: ComponentFixture<EditUsersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUsersPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
