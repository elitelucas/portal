import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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

  @Input() patientData: any;
  @Input() providerData: any;
  @Input() roomName: any;

  patientId = null;

  video: string;
  image: string;
  text: string;

  data: any;
  payData: PayData;
  QRimgKey = [];
  accountKey = false;
  urlKey = false;
  payAmount: string;

  identify_patient = 'OK';
  no_identify_patient = 'NOK';

  constructor(
    public dialog: MatDialog,
    private meetRoomService: MeetRoomService,
    private userService: UserService,
    private _route: Router
  ) {

    this.QRimgKey[0] = false;
    this.QRimgKey[1] = false;

  }

  ngOnInit(): void {

  }

  async ngAfterViewInit() {

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

    this.meetRoomService.patientEnteredInPayPatient(this.providerData._id, this.patientData.dni);

    this.meetRoomService.receivePay().subscribe(payAmount => {
      this.payAmount = payAmount;
    });
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




