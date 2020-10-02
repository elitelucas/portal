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

  @Output() callOutput = new EventEmitter<string>();
  currentUser: any;
  currentUserRole: string = '';

  waitingPatientsData: Patient[];

  provider_connect = 'OK';
  provider_connect_active = 'active';
  provider_connect_inactive = 'inactive';

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
  }

  initSidebar() {
    if (this.authService.getCurrentUser) {
      this.currentUser = this.authService.getCurrentUser;
      this.currentUserRole = this.authService.getCurrentUser.role;
    }
    this.confirmConnect();
    this.listPatient();
    this.meetRoomService.countPatientRoom().subscribe(result => {
      this.trace("updateListPatient counts: " + result);
      this.listPatient();
    });
    
    this.meetRoomService.disconnectPatients().subscribe(result => {
      this.trace("disconnectPatients counts: " + result);
      this.listPatient();
    });
  }

  listPatient() {
    this.providerService.getWaitingPatientsData(this.currentUser.room).subscribe(result => {
      this.waitingPatientsData = [];
      result.forEach( (element : Patient) => {
        this.waitingPatientsData.push(element)
      });
      /*console.log('this.waitingPatientsData')
      console.log(this.waitingPatientsData)*/
    });

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
