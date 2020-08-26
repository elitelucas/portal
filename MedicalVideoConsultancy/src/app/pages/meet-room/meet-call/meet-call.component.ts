import { Component, OnInit, ElementRef, ViewChild, NgZone, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from '../../../_services/provider.service';
import { MeetRoomService } from '../../../_services/meet-room.service';
import { Patient } from '../../../_model/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { timer } from 'rxjs';

@Component({
  selector: 'app-meet-call',
  templateUrl: './meet-call.component.html',
  styleUrls: ['./meet-call.component.css']
})
export class MeetCallComponent implements OnInit {
  roomChatForm: FormGroup;
  @ViewChild('localVideo') public localVideo: ElementRef;
  @ViewChild('remoteVideo') public remoteVideo: ElementRef;
  @ViewChild('chatText') public chatText: ElementRef;

  dniPatient = null;
  patientsEmail: any;

  public patient: Patient;
  public providerSocketId;

  constructor(private route: ActivatedRoute, private providerService: ProviderService,
    private meetRoomService: MeetRoomService, private _ngZone: NgZone, private _router: Router,
    private formBuilder: FormBuilder, private renderer: Renderer2) {
    this.dniPatient = localStorage.getItem('patient_dni');
    this.roomChatForm = this.formBuilder.group({
      text: ['', Validators.required]
    });
  }

  get f() { return this.roomChatForm.controls; }

  async ngOnInit() {
    await this.loadPatient();
  }

  async ngAfterViewInit() {
    this.meetRoomService.setLocalElement(this.localVideo);
    this.meetRoomService.setRemoteElement(this.remoteVideo);
    this.meetRoomService.init();
    this.meetRoomService.connect().subscribe(async (peerId) => {
      console.log("peerId");
      console.log(peerId);
      await timer(200).toPromise();
      this.meetRoomService.confirmConnectPatient(this.patient);
      this.meetRoomService.waitCallComplete().subscribe(async (data) => {
      });
    });
  }

  async loadPatient() {
    this.providerService.getPatient(this.dniPatient, 'dni').subscribe(async (patient: Patient) => {
      if (patient) {
        this.patient = patient;
      };
    });
    this.meetRoomService.recivetext().subscribe((text) => {
      const p = this.renderer.createElement('p');
      const d = this.renderer.createText(text);
      this.renderer.appendChild(p, d);
      this.renderer.appendChild(this.chatText.nativeElement, p);
    });
  }


  public sendText() {
    const text = this.f.text.value;
    //console.log(text)
    this.meetRoomService.sendtext(this.providerSocketId, "Patient: " + text);
  }

  /*trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', arg);
  }*/
}
