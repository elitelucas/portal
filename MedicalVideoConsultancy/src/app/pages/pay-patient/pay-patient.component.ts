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


@Component({
  selector: 'app-pay-patient',
  templateUrl: './pay-patient.component.html',
  styleUrls: ['./pay-patient.component.css']
})
export class PayPatientComponent implements OnInit {

  dniPatient = null;
  patient = null;
  roomName = null;
  providerData: any;
  identify_patient = 'OK';
  no_identify_patient = 'NOK';
  patientsEmail = null;

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private providerService: ProviderService,
    private meetRoomService: MeetRoomService, private _ngZone: NgZone, private _router: Router) {

    this.dniPatient = localStorage.getItem('patient_dni');
    this.route.paramMap.subscribe(params => {
      this.roomName = params.get('roomName');
    });

  }

  ngOnInit(): void {
    console.log(localStorage.getItem('payProvider'));
    this.getFirstPatientsEmail();
    this.meetRoomService.startAttetionOfProvider().subscribe(providerStatus => {
      this.goChatCallAttetion();
    });

  }

  getFirstPatientsEmail() {
    this.providerService.getPatient(this.dniPatient, 'dni').subscribe(patient => {
      this.patient = patient;
      this.meetRoomService.confirmConnectPatient(this.patient);
      this.patientsEmail = patient['email'];
      this.providerService.checkRoomExist(this.roomName).subscribe(result => {
        if (result) {
          this.providerData = result;
        }
      });

    });
  }

  clean() {
    this.providerData = null;
    this.patientsEmail = null;
    localStorage.removeItem("patient_dni")
  }


  confirmPayAttetion() {
    console.log("confirmPayAttetion")
    console.log(this.providerData)
    console.log(this.patient)
    this.meetRoomService.confirmPayAttetion(this.providerData, this.patient);
  }

  goChatCallAttetion() {
    let urlAttetion = "attetion/" + this.roomName;
    this._router.navigateByUrl(urlAttetion);
  }
}
