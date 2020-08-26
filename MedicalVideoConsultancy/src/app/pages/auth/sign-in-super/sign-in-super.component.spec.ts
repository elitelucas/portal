import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInSuperComponent } from './sign-in-super.component';

describe('SignInSuperComponent', () => {
  let component: SignInSuperComponent;
  let fixture: ComponentFixture<SignInSuperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInSuperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInSuperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
