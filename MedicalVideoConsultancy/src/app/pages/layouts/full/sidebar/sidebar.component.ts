import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  HostListener,
  ViewChild,
  ElementRef
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
export class AppSidebarComponent implements OnInit, OnDestroy {

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

  patientListMap = new Map();

  listEvent = null;

  providerRoleOptionsShow = true;

  patientOnattetion = null;

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
  @HostListener('window:beforeunload')
  onBrowserClose() {
    this.ngOnDestroy();
  }
  ngOnDestroy(): void {
    if (this.providerRoleOptionsShow) {
      this.providerService.close();
    }
    //this.listEvent.unsubscribe(); 
  }

  ngOnInit(): void {
    this.initSidebar();
    let tmpArr = [];
    this.firstMenuItems = this.menuItems.getMenuitem(this.currentUserRole);
    /*console.log("this.firstMenuItems");
    console.log(this.firstMenuItems);*/

    this.firstMenuItems.forEach((element, index) => {
      /*console.log(element.state);
      console.log(element.state === 'subscription-plan');
      console.log(element.state === 'feedbacks');*/
      if (element.state === 'subscription-plan' || element.state === 'feedbacks') {
        this.secondMenuItems.push(element);
        tmpArr.push(index);
      }
    });
    /*console.log("this.secondMenuItems");
    console.log(this.secondMenuItems);*/


    tmpArr.sort(function (a, b) { return b - a });
    tmpArr.forEach(item => {
      this.firstMenuItems.splice(item, 1);
    })
  }

  initSidebar() {
    if (this.authService.getCurrentUser) {
      this.currentUser = this.authService.getCurrentUser;
      this.currentUserRole = this.authService.getCurrentUser.role;
      if ('SuperAdmin' == this.currentUserRole || 'Admin' == this.currentUserRole) {
        this.providerRoleOptionsShow = false;
      }
    }
    console.log("this.currentUser.payToDay");
    console.log(this.currentUser.payToDay);
    if (this.providerRoleOptionsShow && this.currentUser.payToDay) {
      this.confirmConnect();
      this.waitingPatientsData = [];
      this.listWaitingPatient();
    }
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

    this.listEvent = this.providerService.getWaitingPatientsData(this.currentUser.room, () => {
      console.log("reconnect getWaitingPatientsData");
      this._ngZone.run(() => {
        this.listWaitingPatient();
      });
    })

    this.listEvent.subscribe(result => {
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
    this.meetRoomService.confirmConnect(this.currentUser);
    if (this.provider_connect_inactive == localStorage.getItem('provider_connect')) {
      localStorage.setItem('provider_connect', this.provider_connect);
      return;
    }
    if (this.provider_connect_active == localStorage.getItem('provider_connect')) {
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
    console.log("nextAttetion")
    //console.log(this.waitingPatientsData)this.meetRoomService.init();
    if (this.waitingPatientsData && this.waitingPatientsData.length > 0) {
      let pat = this.waitingPatientsData[0];
      if (this.patientOnattetion != null) {
        if (pat.dni == this.patientOnattetion.dni) {
          let patListOne = this.waitingPatientsData.splice(0, 1);
          this.waitingPatientsData.push(patListOne[0]);
        }
      }
      this.patientOnattetion = this.waitingPatientsData[0];
      //console.log(patient)
      localStorage.setItem('provider_data', JSON.stringify(this.currentUser));
      localStorage.setItem(this.patientOnattetion._id, JSON.stringify(this.patientOnattetion));
      this.router.navigateByUrl('/dashboard/pay-provider/' + this.patientOnattetion._id);
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
