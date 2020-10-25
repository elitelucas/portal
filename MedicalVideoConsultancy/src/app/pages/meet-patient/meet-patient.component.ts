import { Component, NgZone, OnInit, 
  HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '../../_model/user';
import { AuthPatientService } from '../../_services/auth.patient.service';
import { PatientService } from '../../_services/patient.service';
import { MeetRoomPatientService } from '../../_services/meet-room-patient.service';

@Component({
  selector: 'app-meet-patient',
  templateUrl: './meet-patient.component.html',
  styleUrls: ['./meet-patient.component.css']
})
export class MeetPatientComponent implements OnInit, OnDestroy {

  private roomName: string;
  public providerData: any;
  public patientData: Object;
  public image: string;

  public step = 0;
  public step_waiting_page = 1;
  public step_payment_page = 2;
  public step_attetion_page = 3;
  public step_feeback_page = 4;

  identify = null;
  identify_patient = 'OK';
  no_identify_patient = 'NOK';

  listEvent = null;

  constructor(
    private route: ActivatedRoute,
    private meetRoomPatientService: MeetRoomPatientService,
    private patientService: PatientService,
    //private providerService: ProviderService,
    private authPatientService: AuthPatientService,
    private _ngZone: NgZone,
    private _router: Router) {
    this.patientData = this.authPatientService.getCurrentUser
    /*console.log("MeetPatientComponent this.patientData");
    console.log(this.patientData);*/
    //this.patientData = localStorage.getItem('patient');
    this.identify = localStorage.getItem('patient_auth');
    this.providerData = JSON.parse(localStorage.getItem('provider'));

    this.patientData['providerId'] = this.providerData._id;
    this.patientData['room'] = this.providerData.room;
    this.patientData['providerId'] = this.providerData._id;

    this.route.paramMap.subscribe(params => {
      this.roomName = params.get('roomName');
    });

  }

  @HostListener('window:beforeunload')
  onBrowserClose() {
    console.log("beforeunload");
    this.ngOnDestroy();
  }
  ngOnDestroy(): void {
    console.log("ngOnDestroyngOnDestroyngOnDestroyngOnDestroy");
    this.patientService.close();
    //this.listEvent.unsubscribe(); 
  }


  ngOnInit() {
    if (this.no_identify_patient == this.identify) {
      this._router.navigateByUrl('/auth/sign-in-patient');
      this.clean();
      return;
    }
    if (this.patientData == undefined || this.providerData == undefined) {
      this._router.navigateByUrl('/auth/sign-in-patient');
      this.clean();
      return;
    }

    this.getProviderState();

    this.patientService.updatePatient(this.patientData).subscribe((patientUpdated: Patient) => {
      this.meetRoomPatientService.confirmConnectPatient(patientUpdated);
      this.patientData = patientUpdated;
      this.completeLoad();
    });

  }

  completeLoad(){

    let step_cache = localStorage.getItem('step_attetion');
    if (step_cache) {
      this.step = parseInt(step_cache);
    } else {
      this.patientService.checkRoomExist(this.roomName)
        .subscribe(result => {
          this.providerData = result;
          this.step = this.step_waiting_page;
        });
    }
    this.meetRoomPatientService.providerEntered().subscribe(data => {
      if (data) {
        this.patientService.checkRoomExist(this.roomName)
          .subscribe(result => {
            this.providerData = result;
            this.step = this.step_payment_page;
            localStorage.setItem('step_attetion', this.step.toString());
          });
      }
    });
    this.meetRoomPatientService.receiveConfirmProvider().subscribe(confirmProvider => {
      if (confirmProvider) {
        this.patientService.checkRoomExist(this.roomName)
          .subscribe(result => {
            this.providerData = result;
            this.step = this.step_attetion_page;
            localStorage.setItem('step_attetion', this.step.toString());
          });
      }
    });

    this.meetRoomPatientService.receiveEndCall()
      .subscribe(async (text) => {
        if (text === 'endCall') {
          console.log("send confirm End call to provider : " + this.providerData.socketId);
          this.meetRoomPatientService.endCall(this.providerData.socketId, 'acceptEnd');
          this.meetRoomPatientService.stopVideoAudio();
          this.meetRoomPatientService.disconnectMe();
          this.step = this.step_feeback_page;
          localStorage.setItem('step_attetion', this.step.toString());
        }
      });
  }

  getProviderState(){

    this.listEvent =  this.patientService.getProviderState(this.providerData.room, () => {
      //console.log("reconnect getWaitingPatientsData2");
      this._ngZone.run(() => {
        this.getProviderState();
      });
    });
    
    this.listEvent.subscribe(result => {
      this._ngZone.run(() => {
        let prov = JSON.parse(result);
        //console.log(prov);
        console.log("prov.connection:", prov.connection);
        console.log("prov.calling:", prov.calling);
        this.providerData.connection = prov.connection;
      });
    });
  }

  public exit() {
    this.patientService.disconnectPatient(this.patientData["_id"]).subscribe(async (text) => {
    });;
  }

  clean() {
    this.providerData = null;
    localStorage.removeItem("patient_dni")
    localStorage.removeItem("patient_auth")
  }

  closeinstanceSession() {
    this.clean();
    this._router.navigateByUrl('/');
  }

}
