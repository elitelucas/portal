import { Consult, Provider } from './../../../_model/user';
import { Component, OnInit, ViewChild, ElementRef, NgZone, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MeetRoomService } from '../../../_services/meet-room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from '../../../_services/provider.service';
import { User, Patient } from '../../../_model/user';
import { timer } from 'rxjs';

@Component({
  selector: 'app-health-room',
  templateUrl: './health-room.component.html',
  styleUrls: ['./health-room.component.css']
})
export class HealthRoomComponent implements OnInit {

  roomChatForm: FormGroup;
  @ViewChild('localVideo') public localVideo: ElementRef;
  @ViewChild('remoteVideo') public remoteVideo: ElementRef;
  @ViewChild('chatText') public chatText: ElementRef;

  patient: Patient;
  currentUser: Provider;
  consultId: any;

  key = {
    Prescription: true,
    Consults: false,
    Files: false,
    Charts: false
  };

  disabledCall = false;

  constructor(
    public meetRoomService: MeetRoomService,
    private route: ActivatedRoute,
    public providerService: ProviderService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private _router: Router
  ) {
    this.route.paramMap.subscribe(async (params) => {
      this.patient = JSON.parse(localStorage.getItem(params.get("patientId")));
      this.consultId = params.get('consultId');
    });
    this.currentUser = Object.assign(new Provider(), JSON.parse(localStorage.getItem('provider_data')));
  }

  async ngOnInit() {
    this.roomChatForm = this.formBuilder.group({
      text: ['', Validators.required]
    });
  }

  async ngAfterViewInit() {
    this.meetRoomService.setLocalElement(this.localVideo);
    this.meetRoomService.setRemoteElement(this.remoteVideo);
    this.meetRoomService.startLocalMediaVideo();
    this.meetRoomService.connect().subscribe(peerId => {
      this.currentUser.peerId = peerId;
      this.meetRoomService.preparateVideoCallFormProvider(this.currentUser, this.patient._id);
    });

    this.meetRoomService.patientConnected().subscribe(patient => {
      this.patient = patient;
      this.disabledCall = true;
    });

    this.meetRoomService.recivetext().subscribe((text) => {
      const p = this.renderer.createElement('p');
      const d = this.renderer.createText(text);
      this.renderer.appendChild(p, d);
      this.renderer.appendChild(this.chatText.nativeElement, p);
    });

    this.meetRoomService.receiveEndCall()
      .subscribe(async (text) => {
        console.log("receiveEndCall redirection: ", text);
        if (text === 'acceptEnd') {
          this._router.navigateByUrl("/dashboard/health-provider")
        }
      });
  }

  get f() { return this.roomChatForm.controls; }

  public sendText() {
    const text = this.f.text.value;
    this.meetRoomService.sendtext(this.patient.socketId, "Provider: " + text);
  }

  public mute() {
    this.meetRoomService.localMuteActive(true);
  }

  public desmute() {
    this.meetRoomService.localMuteActive(false);
  }

  public videomute() {
    this.meetRoomService.localVideoActive(true);
  }

  public videodesmute() {
    this.meetRoomService.localVideoActive(false);
  }

  async startVideoCall() {
    this.meetRoomService.callPatient(this.patient);
    this.meetRoomService.waitCallComplete().subscribe(text => {
    })
  }



  changeBackground(kk) {
    this.key.Prescription = false;
    this.key.Consults = false;
    this.key.Files = false;
    this.key.Charts = false;
    this.key[kk] = true;
  }

  public endCall() {
    this.providerService.closeConsult(this.consultId).subscribe(res => {
      console.log("send End call patient : " + this.patient.socketId);
      this.meetRoomService.endCall(this.patient.socketId, 'endCall');
      this.meetRoomService.stopVideoAudio();
    });
  }

}
