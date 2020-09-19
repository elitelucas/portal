import { Consult } from './../../../_model/user';
import { Component, OnInit, ViewChild, ElementRef, NgZone, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MeetRoomService } from '../../../_services/meet-room.service';
import { ActivatedRoute } from '@angular/router';
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
  currentUser: User;
  consultData:any;
  key={
    Prescription:true,
    Consults: false,
    Files: false,
    Charts: false
  };


  constructor(
    public meetRoomService: MeetRoomService,
    private route: ActivatedRoute,
    public providerService: ProviderService,
    private ngZone: NgZone,
    private formBuilder: FormBuilder,
    private renderer: Renderer2) {
    this.route.paramMap.subscribe(async (params) => {
      this.patient = JSON.parse(localStorage.getItem(params.get("patientId")));
      console.log('this.patient')
      console.log(this.patient)
    });
    this.currentUser = Object.assign(new User(), JSON.parse(localStorage.getItem('provider_data')));
    console.log('this.currentUser')
    console.log(this.currentUser)
  }

  async ngOnInit() {
    const providerInfo=JSON.parse(localStorage.getItem('provider_data'));
    this.providerService
    .createConsult({patientId:this.patient._id, providerId:providerInfo.id, dni:this.patient.dni})
    .subscribe(res=>{
      this.consultData=res;
      console.log('this.consultData')
      console.log(this.consultData)
    })
    this.start();
    this.roomChatForm = this.formBuilder.group({
      text: ['', Validators.required]
    });
    this.meetRoomService.confirmPatientCall().subscribe(data=>{
      console.log('ertertertert')
      console.log(data)
    })
  }

  async ngAfterViewInit() {
    this.meetRoomService.setLocalElement(this.localVideo);
    this.meetRoomService.setRemoteElement(this.remoteVideo);
    this.meetRoomService.init();

    this.meetRoomService.connect().subscribe(async (peerId) => {
      console.log("peerId");
      console.log(peerId);
      this.meetRoomService.confirmConnect(this.currentUser);
      this.meetRoomService.updatePatientState().subscribe(async (pt: Patient) => {
        this.patient = pt;
        console.log("this.patient provider----------------------")
        console.log('this.patient222')
        console.log(this.patient)
        this.meetRoomService.callPatient(this.patient);
      });
    });
  }

  async start() {
    this.ngZone.runOutsideAngular(() => {
      this.meetRoomService.startAttetion(this.currentUser, this.patient);
      this.providerService.getPatient(this.patient.dni, 'dni').subscribe(async (pt: Patient) => {
        this.patient = pt;
      });
    });
    this.meetRoomService.recivetext().subscribe((text) => {
      const p = this.renderer.createElement('p');
      const d = this.renderer.createText(text);
      this.renderer.appendChild(p, d);
      this.renderer.appendChild(this.chatText.nativeElement, p);
    });
  }

  get f() { return this.roomChatForm.controls; }

  public sendText() {
    const text = this.f.text.value;
    this.meetRoomService.sendtext(this.patient.socketId, "Provider: " + text);
  }
  changeBackground(kk){
    this.key.Prescription=false;
    this.key.Consults=false;
    this.key.Files=false;
    this.key.Charts=false;
    this.key[kk]=true;
  }

  /*trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', arg);
  }*/

}
