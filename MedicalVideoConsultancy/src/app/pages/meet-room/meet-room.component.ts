import { Component, ElementRef, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";
import { ProviderService } from "../../_services/provider.service";
import { environment } from "../../../environments/environment";
import { constant } from "../../_config/constant";
import { MeetRoomService } from "../../_services/meet-room.service";
//import { WebcamInitError, WebcamUtil, WebcamImage} from "ngx-webcam";
import { Observable, Subject } from "rxjs";
import { RouterModule, Routes } from '@angular/router';
import { Patient } from '../../_model/user';
import { UserService } from './../../_services/user.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';






@Component({
  selector: 'app-meet-provider',
  templateUrl: './meet-room.component.html',
  styleUrls: ['./meet-room.component.css']
})
export class MeetRoomComponent implements OnInit {
  @ViewChild('localVideo') public localVideo: ElementRef;

  patientId = null;

  //patient : any ;

  private roomName: string;
  public providerData: any;
  public roomData: any;

  video: string;
  image: string;
  text: string;
  providerEnteredKey:boolean=false;

  defaultVideo = constant.defaultVideo;
  defaultImage = constant.defaultImage;
  tipsImage = constant.tipsImage;
  defaultText = constant.defaultText;
  literalArr=[];

  publicUrl = environment.baseUrl + "public/";

  dniPatient = null;
  patientsEmail: any;

  public patientData: Object;
  private patientEmail: string;

  identify_patient = 'OK';
  no_identify_patient = 'NOK';

  constructor(
    private route: ActivatedRoute, 
    public dialog: MatDialog, 
    private providerService: ProviderService,
    private meetRoomService: MeetRoomService, 
    private _ngZone: NgZone, 
    private _router: Router,
    private userService:UserService
    ) {

    this.dniPatient = localStorage.getItem('patient_dni');
    this.route.paramMap.subscribe(params => {
      this.roomName = params.get('roomName');
    });

  }

  ngOnInit(): void {
    if (this.no_identify_patient == localStorage.getItem('patient_auth')) {
      this._router.navigateByUrl('/auth/sign-in-patient');
      this.clean();
      return;
    }
    if (this.identify_patient == localStorage.getItem('patient_auth')) {
      localStorage.setItem('patient_auth', this.no_identify_patient);
    }

    if (!this.dniPatient) {
      this._router.navigateByUrl('/auth/sign-in-patient');
      this.clean();
      return;
    }
    if (this.roomName) {
      this.getFirstPatientsEmail();
    }

    //receive the info that the provider entered the pay-provider page.
    this.meetRoomService.providerEntered().subscribe(data=>{
      if (data){
        this._router.navigateByUrl('/payAttetion/'+this.roomName);
      }
    })

  }

  getFirstPatientsEmail() {
    this.providerService.getPatient(this.dniPatient, 'dni').subscribe(patient => {
      this.trace("patient", patient)
      this.patientsEmail = patient['email'];
      this.providerService.checkRoomExist(this.roomName).subscribe(result => {
        if (result) {
          this.providerData = result;
          this.getRoomDataById(this.providerData._id);
           //fetch post data from provider
          this.userService.getBlog(this.providerData._id).subscribe(res=>{
          console.log('res')
          console.log(res)
          this.literalArr=res;
       })
          this.openCheckPatient();
        }
      });
      if (this.providerData) {
        this._router.navigateByUrl('/auth/sign-in-patient');
        this.clean();
      }
    });
  }

  clean() {
    this.providerData = null;
    this.patientsEmail = null;
    localStorage.removeItem("patient_dni")
  }

  closeinstanceSession() {
    this._router.navigateByUrl('/');
    this.clean();
  }

  getRoomDataById(id) {
    this.providerService.getRoomData(id).subscribe(result => {
      this.roomData = result;
      this.video = this.roomData && this.roomData.video ? this.publicUrl + "video/" + this.roomData.video : this.defaultVideo;
      this.image = this.roomData && this.roomData.image ? this.publicUrl + "image/" + this.roomData.image : this.defaultImage;
      this.text = this.roomData && this.roomData.text ? this.roomData.text : this.defaultText;
    })
  }

  async openCheckPatient() {
    /*const firstName = this.providerData ? this.providerData.firstName: '';
    const role = this.providerData ? this.providerData.role: '';*/
    this.providerService.getPatient(this.patientsEmail, 'email').subscribe(patient => {
      if (patient) {
        this.patientEmail = patient['email'];
        patient['room'] = this.roomName;
        //patientData['avatar'] = JSON.stringify(this.webcamImage.imageAsDataUrl);
        patient['providerId'] = this.providerData._id;
        this.patientData = patient;
        this.providerService.updatePatient(patient).subscribe((patientUpdated: Patient) => {
          this.meetRoomService.confirmConnectPatient(patientUpdated);
          this.providerData = patientUpdated;
          this.showPreView();
        });
        /*this.meetRoomService.startCallWithProvider().subscribe(resultProvider => {
          this.setCallremote(resultProvider)
        });*/
      };
    });


    this.meetRoomService.connectioProvider().subscribe(providerStatus => {
      this.providerData.connection = true
    });
    this.meetRoomService.disconnectioProvider().subscribe(providerStatus => {
      this.providerData.connection = false
    });

  }

  async showPreView() {
    let localStream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    this.localVideo.nativeElement.srcObject = localStream;
  }

  setCallremote(resultProvider) {
    console.log("openCheckPatient resultProvider:", resultProvider);
    //this.meetRoomService.setCallremote(resultProvider)

  }

  async startCall(meetPatient, offertData, socketId) {
    console.log("startCall meetPatient:", meetPatient, socketId)
    let room = this.roomName;
  }

  trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', arg);
  }

  goPayAttetion() {
    let urlAttetion = "payAttetion/" + this.roomName;
    this.trace(urlAttetion);
    this._router.navigateByUrl(urlAttetion);
  }
  receiveProviderId(){
    this.meetRoomService.receiveProvideId().subscribe(providerId=>{
      console.log('providerIdqqq')
      console.log(providerId)
    })
  }
  ngAfterViewInit(){
   
  }

}












