import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {MeetRoomService} from "../../_services/meet-room.service";
import {environment} from "../../../environments/environment";

/*
declare let JitsiMeetExternalAPI: any;
*/

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css']
})
export class VideoRoomComponent implements OnInit {
  private roomName: string;
  private api = null;
  private calling: boolean = false;

  constructor(private route: ActivatedRoute, private meetRoomService: MeetRoomService) { this.getRoomName(); }

  ngOnInit(): void {
    this.roomListener()
  }

  getRoomName() {
    this.route.paramMap.subscribe(params => {
      this.roomName = params.get('roomName');
    })
  }

  roomListener() {
   /* this.meetRoomService.getUserDataObserver().subscribe(userData => {
      userData.patientsData.forEach(patient => {
        if(patient.calling === true)
        {this.startCall(patient);}
      });
    });*/
    
  }

  startCall(patient) {
    if(this.api) return false;
    let domain = environment.jitBaseUrl;
    let room = patient['room'];
    let options = {
      roomName: room,
      parentNode: document.querySelector('#meet-provider'),
    };
    /*this.api = new JitsiMeetExternalAPI(domain, options);
    this.api.on('readyToClose', (room: any) => {
      window.close();
    });*/

  }

}
