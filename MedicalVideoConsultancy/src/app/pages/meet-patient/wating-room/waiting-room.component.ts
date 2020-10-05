import { Component, ElementRef, Inject, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";
import { ProviderService } from "../../../_services/provider.service";
import { environment } from "../../../../environments/environment";
import { constant } from "../../../_config/constant";
import { MeetRoomService } from "../../../_services/meet-room.service";
import { UserService } from './../../../_services/user.service';
import { ContentBlogService } from '../../../_services/content-blog.service';


@Component({
  selector: 'app-waiting',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css']
})
export class WaitingRoomComponent implements OnInit {

  @ViewChild('localVideo') public localVideo: ElementRef;
  @Input() patientData: any;
  @Input() providerData: any;
  @Input() roomName: any;

  video: string;
  image: string;
  text: string;
  smsData: any;
  roomUrl: string;
  domain = environment.domain;
  providerEnteredKey: boolean = false;

  defaultVideo = constant.defaultVideo;
  defaultImage = constant.defaultImage;
  tipsImage = constant.tipsImage;
  defaultText = constant.defaultText;
  literalArr = [];

  constructor(
    public dialog: MatDialog,
    private providerService: ProviderService,
    private meetRoomService: MeetRoomService,
    private _router: Router,
    private userService: UserService,
    private contentBlogService: ContentBlogService
  ) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.userService.getBlog(this.providerData._id).subscribe(res => {
      this.literalArr = res;
      this.literalArr.forEach(item => {
        this.contentBlogService.getByUrl(item.url).subscribe(html => {
          item.postBody = html;
        });
      });
    });
    this.showPreView();
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
    const body = "Hello, this is " + this.providerData.role + "." + this.providerData.lastName + " - please join me for a secure video call: \n" + "https://pasatra.com/"
      + this.providerData.room + "\n" + "%0a" + "%0a" +
      "Use a computer or device with a good internet connection and webcam. If you run into issues connecting, restart your computer " + "%0a" + "%0a" + "or check out the pasatra.com http://help.pasatra.com \n" +
      "Simple, free, and secure telemedicine powered by https://Pasatra.com \n";
    const mailUrl = option === 'GMail' ? 'https://mail.google.com/mail/?view=cm&fs=1&su=' + subject + '&body=' + body :
      (option === "OMail" ? "https://outlook.live.com/owa/?path=/mail/action/compose&?&subject=" + subject + '&body=' + body : "mailto:?Subject=" + subject + '&body=' + body);
    this._router.navigate([]).then(result => { window.open(mailUrl, '_blank') })
  }

  openDialogue(option): void {
    const smsContent = " - please join me for a secure video call: \n" + "https://pasatra.com/"
      + this.providerData.room + "\n" +
      "Use a computer or device with a good internet connection and webcam. If you run into issues connecting, restart your computer or check out the pasatra.com http://help.pasatra.com \n" +
      "Simple, free, and secure telemedicine powered by https://Pasatra.com \n";
    const dialogRef = this.dialog.open(InviteBySms2, {
      width: '400px',
      data: { phoneNumber: '', room: this.roomUrl, smsContent: smsContent }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.smsData = result;
      this.sendInvite(option);
    })
  }

  async showPreView() {
    let localStream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    this.localVideo.nativeElement.srcObject = localStream;
  }

  receiveProviderId() {
    this.meetRoomService.receiveProvideId().subscribe(providerId => {
      console.log('providerIdqqq')
      console.log(providerId)
    })
  }


}
@Component({
  selector: 'invite-by-sms2',
  templateUrl: 'invite-by-sms2.html',
})
export class InviteBySms2 {
  isValidNumber: boolean = true;
  isInvited: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<WaitingRoomComponent>,
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












