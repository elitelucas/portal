import { TestBed } from '@angular/core/testing';

import { MeetRoomService } from './meet-room.service';

describe('MeetRoomService', () => {
  let service: MeetRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeetRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
