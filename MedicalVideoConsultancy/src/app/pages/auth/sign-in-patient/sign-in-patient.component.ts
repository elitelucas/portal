import { Patient } from './../../../_model/user';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { ProviderService } from "../../../_services/provider.service";
import { AuthPatientService } from '../../../_services/auth.patient.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-in-patient',
  templateUrl: './sign-in-patient.component.html',
  styleUrls: ['./sign-in-patient.component.css']
})
export class SignInPatientComponent implements OnInit {
  step = 1;
  roomForm: FormGroup;
  enterForm: FormGroup;
  joinForm: FormGroup;
  submitted = false;
  entered=false;
  domain = environment.domain;
  //dniData: any;
  patientData: any;
  providerData: any;
  isInvalidDomain: boolean = false;
  isValidRoom: boolean = true;
  verifyKey=false;
  roomName;
  dniPatient;

  isDuplicatedEmail: boolean = false;
  isEmptyPhoneNumber: boolean = false;
  isDuplicatedPhone: boolean = false;
  isValidNumber: boolean = true;
  isDuplicatedDNI: boolean = false;
  directRoomUrl: string = '';
  private phoneNumber: any;

  identify_patient = 'OK';
  no_identify_patient = 'NOK';

  constructor(private formBuilder: FormBuilder,
    private authPatientService: AuthPatientService,
    private router: Router,
    private providerService: ProviderService) { }

  ngOnInit(): void {
    this.initData();
  }

  initData() {
    localStorage.removeItem('step_attetion');
    localStorage.removeItem('patient_auth');
    localStorage.removeItem('patient');
    localStorage.removeItem('provider');
    localStorage.removeItem('patient_dni');
    this.roomForm = this.formBuilder.group({
      room: ['', [Validators.required, Validators.minLength(this.domain.length + 1)]],
      dni: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(1)]],
      typeAttetion: ['', Validators.required]
    });

    this.f.dni.setValue("12312323");
    this.f.room.setValue(this.domain + "testroom2");
    // this.f.room.setValue(this.domain);

    this.joinForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      //providerId: ['', Validators.required],
      room: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(1)]],
      typeAttetion: ['', Validators.required]
    });
  }

  get f() { return this.roomForm.controls; }
  get f1() { return this.joinForm.controls; }

  checkRoom() {
    localStorage.setItem('patient_auth', this.no_identify_patient);
    if (this.roomForm.valid) {
      this.authPatientService.joinValidatePatient(this.roomForm.value).subscribe((resultPatient) => {
        this.submitted = true;
        const room = this.f.room.value.substring(this.domain.length);
        const dniPatient = this.f.dni.value;
        this.providerService.checkRoomExist(room)
          .subscribe(result => {
            if (result) {
              this.step = 2;
              this.submitted = false;
              this.patientData = resultPatient.patient;
              this.providerData = result;
              this.directRoomUrl = '/' + this.providerData.room;
              localStorage.setItem('patient', JSON.stringify(this.patientData));
              localStorage.setItem('provider', JSON.stringify(this.providerData));
              localStorage.setItem('patient_auth', this.identify_patient);
              this.router.navigateByUrl(this.directRoomUrl);
            }
            else {
              this.isValidRoom = false;
            }
          });
      }, error => {
        this.step = 2;
        this.f1.room.setValue(this.f.room.value);
        this.f1.dni.setValue(this.f.dni.value);
        this.f1.reason.setValue(this.f.reason.value);
        this.f1.typeAttetion.setValue(this.f.typeAttetion.value);
      });

    }
  }

  hasError(event: boolean) {
    this.isValidNumber = event;
  }

  getNumber(phoneNumber: any) {
    this.phoneNumber = phoneNumber;
    return this.phoneNumber;
  }

  join() {
    localStorage.setItem('patient_auth', this.no_identify_patient);
    this.submitted = true;
    if (this.joinForm.invalid) {
      return;
    }
    this.joinForm.value.phoneNumber = this.phoneNumber;
    this.authPatientService.join(this.joinForm.value)
      .subscribe(result => {
        if (result) {
          this.authPatientService.joinValidatePatient(result).subscribe(resultPatient => {
            const room = this.f1.room.value.substring(this.domain.length);
            this.providerService.checkRoomExist(room)
              .subscribe(result => {
                this.providerData = result;
                this.directRoomUrl = '/' + this.providerData.room;
                this.patientData = resultPatient.patient;
                localStorage.setItem('patient', this.patientData);
                localStorage.setItem('provider', JSON.stringify(this.providerData));
                localStorage.setItem('patient_auth', this.identify_patient);
                this.router.navigateByUrl(this.directRoomUrl);
                this.step = 1
                this.providerData = null;
                this.directRoomUrl = null;
              });
          });
        }
      }, error => {
        if (error) {
          if (error.error) error.error.errors[0].field === "dni" ? this.isDuplicatedDNI = true : (error.error.errors[0].field === 'phoneNumber' ? this.isDuplicatedPhone = true : this.isDuplicatedEmail = true);
        }
      })
  }


  onReset() {
    this.submitted = false;
    this.isDuplicatedEmail = false;
    this.isDuplicatedPhone = false;
    this.isDuplicatedDNI = false;
    this.isValidNumber = true;
    this.isEmptyPhoneNumber = false;
    this.joinForm.reset();
  }
}
