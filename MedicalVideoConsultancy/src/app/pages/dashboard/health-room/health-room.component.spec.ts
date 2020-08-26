import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRoomComponent } from './health-room.component';

describe('HealthRoomComponent', () => {
  let component: HealthRoomComponent;
  let fixture: ComponentFixture<HealthRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
