import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MenuItems } from '../../../shared/menu-items/menu-items';
import { AuthService } from "../../../../_services/auth.service";
import { ProviderService } from "../../../../_services/provider.service";
import { DomSanitizer } from "@angular/platform-browser";
import { MeetRoomService } from "../../../../_services/meet-room.service";
import { Router } from "@angular/router";
import { Patient } from '../../../../_model/user';
import { timer } from 'rxjs';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class AppSidebarComponent implements OnInit {

  public btnActiveShow: boolean = true;
  public btnDesactiveShow: boolean = false;
  public audioActivateShow: boolean = true;
  public audioActivate: boolean = false;

  @Output() callOutput = new EventEmitter<string>();
  currentUser: any;
  currentUserRole: string = '';

  waitingPatientsData: Patient[];

  provider_connect = 'OK';
  provider_connect_active = 'active';
  provider_connect_inactive = 'inactive';
  firstMenuItems = [];
  secondMenuItems = [];
  // alarmButtonKey = false;
  audio: any;

  patientListMap = new Map()

  constructor(
    public menuItems: MenuItems,
    protected authService: AuthService,
    public providerService: ProviderService,
    public domSanitizer: DomSanitizer,
    private meetRoomService: MeetRoomService,
    private _ngZone: NgZone,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.initSidebar();
    let tmpArr = [];
    this.firstMenuItems = this.menuItems.getMenuitem(this.currentUserRole);
    this.firstMenuItems.forEach((element, index) => {
      if (element.state === 'subscription-plan' || element.state === 'feedbacks') {
        this.secondMenuItems.push(element);
        tmpArr.push(index);
      }
    });
    tmpArr.sort(function (a, b) { return b - a });
    tmpArr.forEach(item => {
      this.firstMenuItems.splice(item, 1);
    })
  }

  initSidebar() {
    if (this.authService.getCurrentUser) {
      this.currentUser = this.authService.getCurrentUser;
      this.currentUserRole = this.authService.getCurrentUser.role;
    }
    this.confirmConnect();
    this.waitingPatientsData = [];
    this.listWaitingPatient();
  }

  alarmActive() {
    this.audioActivate = true;
    this.audioActivateShow = false;
  }

  alarmInactive() {
    this.audioActivate = false;
    this.audioActivateShow = true;
  }

  alarm() {
    if (this.audioActivate) {
      this.audio = new Audio();
      this.audio.src = "../../../../../assets/sounds/patientAlarm.mp3";
      this.audio.load();
      this.audio.play();
    }
  }

  listWaitingPatient() {
    this.providerService.getWaitingPatientsData(this.currentUser.room, () => {
      //console.log("reconnect getWaitingPatientsData2");
      this._ngZone.run(() => {
        this.listWaitingPatient();
      });
    }).subscribe(result => {
      this._ngZone.run(() => {
        const data = JSON.parse(result);
        if (data.connection) {
          //if (!this.patientListMap.get(data._id)) {
          this.patientListMap.set(data._id, data);
          this.updateList();
          if (this.waitingPatientsData.length < 2 && this.waitingPatientsData.length > 0) {
            this.alarm();
          }
          //}
        } else {
          if (this.patientListMap.get(data._id)) {
            this.patientListMap.delete(data._id);
            this.updateList();
          }
        }
      });
    });
  }

  updateList() {
    this.waitingPatientsData = Array.from(this.patientListMap.values());
  }

  async confirmConnect() {

    //await timer(2000).toPromise();  
    if (this.provider_connect_inactive == localStorage.getItem('provider_connect')) {
      localStorage.setItem('provider_connect', this.provider_connect);
      this.meetRoomService.confirmConnect(this.currentUser);
      return;
    }
    if (this.provider_connect_active == localStorage.getItem('provider_connect')) {
      this.meetRoomService.confirmConnect(this.currentUser);
      this.desactive();
    }
    this.active();
  }

  active() {
    localStorage.setItem('provider_connect', this.provider_connect_active);
    this.btnDesactiveShow = true;
    this.btnActiveShow = false;
    this.meetRoomService.activeProvider(this.currentUser);
  }

  desactive() {
    localStorage.setItem('provider_connect', this.provider_connect_inactive);
    this.btnDesactiveShow = false;
    this.btnActiveShow = true;
    this.meetRoomService.desactiveProvider(this.currentUser);
  }

  publicMe() {
    this.meetRoomService.publicMe(this.currentUser.id);
  }

  privateMe() {
    this.meetRoomService.privateMe(this.currentUser.id);
  }


  nextAttetion() {
    // console.log("startPreCall")
    //console.log(this.waitingPatientsData)this.meetRoomService.init();
    if (this.waitingPatientsData && this.waitingPatientsData.length) {
      let patient = this.waitingPatientsData[0];
      //console.log(patient)
      localStorage.setItem('provider_data', JSON.stringify(this.currentUser));
      localStorage.setItem(patient._id, JSON.stringify(patient));
      this.router.navigateByUrl('/dashboard/pay-provider/' + patient._id);
    }
  }

  trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    //console.log(now + ': ', arg);
  }



  /*
    initPatientAvatar(patient) {
      const buffer = patient.avatar.data;
      const arrayBuffer = new Uint8Array(buffer);
      const stringChar = arrayBuffer.reduce((data, byte) => {
        return data + String.fromCharCode(byte)
      }, '');
      const base64String = btoa(stringChar);
      return this.domSanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,' + base64String);
    }*/
}
