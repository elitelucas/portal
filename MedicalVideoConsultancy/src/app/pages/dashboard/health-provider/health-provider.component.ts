import { Component, Inject, NgZone, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { AuthService } from "../../../_services/auth.service";
import { environment } from "../../../../environments/environment";
import { ProviderService } from "../../../_services/provider.service";
import { Router } from "@angular/router";
import { MeetRoomService } from "../../../_services/meet-room.service";
import { WebcamInitError, WebcamUtil } from "ngx-webcam";
import { Patient, Consult } from "../../../_model/user";

@Component({
  selector: 'app-health-provider',
  templateUrl: './health-provider.component.html',
  styleUrls: ['./health-provider.component.css']
})
export class HealthProviderComponent implements OnInit{
  currentUser: any;

  listLastAttetions: Consult[] = null;

  patientsData = [];
  roomUrl: string;
  domain = environment.domain;
  smsData: any;
  noDevice: boolean = true;
  private webCamError = [];


  displayedColumns: string[] = ['dni', 'fullName', 'paymentType', 'detail'];
  noDataToDisplay: boolean = false;
  dataSource: any;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private authService: AuthService, private providerService: ProviderService,
    public dialog: MatDialog, private router: Router,
    private meetRoomService: MeetRoomService, private _ngZone: NgZone) {
    this.currentUser = this.authService.getCurrentUser;
  }
  

  ngOnInit(): void {
    this.initProviderRoom();
  }

  initProviderRoom() {
    this.roomUrl = this.domain + this.currentUser.room;
    this.checkConnectionStatus();
    this.getWaitingPatientsData();
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.noDevice = !mediaDevices.length;
      });
    this.loadLastAttetions();
  }

  loadLastAttetions() {
    this.providerService.getLastAttetionsPatientsData(this.currentUser.id)
      .subscribe(result => {
        console.log("loadLastAttetions", result)

        const patientData: Consult[] = [];
        result.forEach(function (item) {
          if (item) {
            patientData.push(item);
          }
        });
        this.dataSource = new MatTableDataSource<Consult>(patientData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    /*
   */
  }

  checkConnectionStatus() {
    //this.meetRoomService.setUpConnection(this.currentUser);
  }

  getWaitingPatientsData() {
    this.providerService.getWaitingPatientsData(this.currentUser.room)
      .subscribe(result => { this.patientsData = result; console.log("waiting room patients", result) });
  }

  copyRoomAddress(inputRoom) {
    inputRoom.select();
    document.execCommand('copy');
    inputRoom.setSelectionRange(0, 0);
  }

  saveRoomAddress(inputRoom) {

  }

  sendInvite(option) {
    switch (option) {
      case 'sms':
        this.providerService.sendSMS(this.smsData.data).subscribe(result => {
          if (!result.errorCode) {
            console.log("Invite sent by SMS", result)
          }
        });
        break;
      case 'gmail':
        this.sendMail('GMail');
        break;
      case 'outlook':
        this.sendMail('OMail');
        break;
      default:
        this.sendMail('defaultMail');
    }
  }

  sendMail(option) {
    const subject = "Telemedicine meeting invitation";
    const body = "Hello, this is " + this.currentUser.role + "." + this.currentUser.lastName + " - please join me for a secure video call: \n" + "https://pasatra.com/"
      + this.currentUser.room + "\n" + "%0a" + "%0a" +
      "Use a computer or device with a good internet connection and webcam. If you run into issues connecting, restart your computer " + "%0a" + "%0a" + "or check out the pasatra.com http://help.pasatra.com \n" +
      "Simple, free, and secure telemedicine powered by https://Pasatra.com \n";
    const mailUrl = option === 'GMail' ? 'https://mail.google.com/mail/?view=cm&fs=1&su=' + subject + '&body=' + body :
      (option === "OMail" ? "https://outlook.live.com/owa/?path=/mail/action/compose&?&subject=" + subject + '&body=' + body : "mailto:?Subject=" + subject + '&body=' + body);
    this.router.navigate([]).then(result => { window.open(mailUrl, '_blank') })
  }


  openDialogue(option): void {
    const smsContent = "Hello, this is " + this.currentUser.role + "." + this.currentUser.lastName + " - please join me for a secure video call: \n" + "https://pasatra.com/"
      + this.currentUser.room + "\n" +
      "Use a computer or device with a good internet connection and webcam. If you run into issues connecting, restart your computer or check out the pasatra.com http://help.pasatra.com \n" +
      "Simple, free, and secure telemedicine powered by https://Pasatra.com \n";
    const dialogRef = this.dialog.open(InviteBySms, {
      width: '400px',
      data: { phoneNumber: '', room: this.roomUrl, smsContent: smsContent }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.smsData = result;
      this.sendInvite(option);
    })
  }


  handleInitError(error: WebcamInitError) {
    this.webCamError.push(error);
    console.log('camera error', this.webCamError)
  }
  detail(param){
    this.router.navigateByUrl('/dashboard/patient/'+param.id+'/'+param.dni+'/'+param.fullName);
  }


}


@Component({
  selector: 'invite-by-sms',
  templateUrl: 'invite-by-sms.html',
})
export class InviteBySms {
  isValidNumber: boolean = true;
  isInvited: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<HealthProviderComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
      console.log('data')
      console.log(data)
     }
  onCancelClick(): void {
    this.isValidNumber = true;
    this.dialogRef.close({ event: 'cancel' });
  }

  inviteBySms() {
    this.isInvited = true;
    if (!this.data.phoneNumber || (!this.isValidNumber)) {
      return;
    }
    this.dialogRef.close({ event: 'sendSms', data: this.data })
  }

  hasError(status: boolean) {
    this.isValidNumber = status;
  }

  getNumber(phoneNumber: any) {
    this.data.phoneNumber = phoneNumber;
  }
 

}
