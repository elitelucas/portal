import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";
import { ProviderService } from "../../../_services/provider.service";
import { environment } from "../../../../environments/environment";
import { constant } from "../../../_config/constant";
import { MeetRoomService } from "../../../_services/meet-room.service";
import { Patient } from '../../../_model/user';
import { UserService } from "../../../_services/user.service";
import { AuthService } from "../../../_services/auth.service";


export interface PayData {
  QRimg: object[];
  account: string[];
  url: string[];
}

@Component({
  selector: 'app-pay-patient',
  templateUrl: './pay-patient.component.html',
  styleUrls: ['./pay-patient.component.css']
})
export class PayPatientComponent implements OnInit {
  @ViewChild('localVideo') public localVideo: ElementRef;

  patientId = null;

  //patient : any ;

  private roomName: string;
  public providerData: any;
  public roomData: any;

  video: string;
  image: string;
  text: string;

  data: any;
  //currentUser: any;
  payData: PayData;
  QRimgKey = [];
  accountKey = false;
  urlKey = false;
  payAmount: string;


  defaultVideo = constant.defaultVideo;
  defaultImage = constant.defaultImage;
  tipsImage = constant.tipsImage;
  defaultText = constant.defaultText;

  publicUrl = environment.baseUrl + "public/";

  dniPatient = null;

  public patientData: Object;

  identify_patient = 'OK';
  no_identify_patient = 'NOK';

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private providerService: ProviderService,
    private meetRoomService: MeetRoomService,
    private userService: UserService,
    private authService: AuthService,
    private _route: Router
  ) {

    this.route.paramMap.subscribe(params => {
      this.roomName = params.get('roomName');
    });
    this.dniPatient = localStorage.getItem('patient_dni');
    this.QRimgKey[0] = false;
    this.QRimgKey[1] = false;
  }

  ngOnInit(): void {

    
    this.providerService.checkRoomExist(this.roomName).subscribe(result => {
      if (result) {
        this.providerData = result;
        console.log("providerData");
        console.log(this.providerData);
        this.userService.getPayData(this.providerData._id).subscribe(res => {
          this.payData = res;
          if (res === null || res.length === 0) {
            this.payData = {
              QRimg: [],
              account: [],
              url: []
            }
          }
          if (this.payData) {
            if (this.payData.QRimg) {
              if (this.payData.QRimg[0]) {
                this.QRimgKey[0] = true;
              }
              if (this.payData.QRimg[1]) {
                this.QRimgKey[1] = true;
              }
            } else {
              this.payData.QRimg = [];
            }
            if (this.payData.account) {
              this.accountKey = true;
            } else {
              this.payData.account = [];
            }
            if (this.payData.url) {
              this.urlKey = true;
            } else {
              this.payData.url = []
            }
          }
        });
        this.getRoomDataById(this.providerData._id);
        this.meetRoomService.patientEnteredInPayPatient(this.providerData._id, this.dniPatient);

      }
    });
  }
  getRoomDataById(id) {
    this.providerService.getRoomData(id).subscribe(result => {
      this.roomData = result;
      this.video = this.roomData && this.roomData.video ? this.publicUrl + "video/" + this.roomData.video : this.defaultVideo;
      this.image = this.roomData && this.roomData.image ? this.publicUrl + "image/" + this.roomData.image : this.defaultImage;
      this.text = this.roomData && this.roomData.text ? this.roomData.text : this.defaultText;
    })
  }
  async ngAfterViewInit() {
    this.meetRoomService.receivePay().subscribe(payAmount => {
      this.payAmount = payAmount;
    })
    this.meetRoomService.receiveConfirmProvider().subscribe(confirmProvider => {
      if (confirmProvider)
        this._route.navigateByUrl('attetion/' + this.roomName)
    })
  }
  confirmPay() {
    this.meetRoomService.confirmPay(this.providerData._id);
  }
  Cancel() {
    this._route.navigateByUrl('/auth/sign-in-patient');
    this.clean();
    return;
  }
  clean() {
    this.providerData = null;
    localStorage.removeItem("patient_dni")
  }


}




