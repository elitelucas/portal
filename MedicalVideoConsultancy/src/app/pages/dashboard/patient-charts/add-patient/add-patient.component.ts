import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { environment } from "../../../../../environments/environment";
import { ProviderService } from "../../../../_services/provider.service";
import { AuthPatientService } from '../../../../_services/auth.patient.service';
import { AuthService } from '../../../../_services/auth.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.css']
})
export class AddPatientComponent implements OnInit {

  provider = null;

  step = 1;

  roomForm: FormGroup;
  joinForm: FormGroup;
  submitted = false;

  patientData: any;
  providerData: any;

  isInvalidDomain: boolean = false;

  isDuplicatedEmail: boolean = false;
  isEmptyPhoneNumber: boolean = false;
  isDuplicatedPhone: boolean = false;
  isValidNumber: boolean = true;
  isDuplicatedDNI: boolean = false;

  private phoneNumber: any;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private authPatientService: AuthPatientService,
    public dialogRef: MatDialogRef<AddPatientComponent>,) { }

  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.provider = this.authService.getCurrentUser;
    this.roomForm = this.formBuilder.group({
      dni: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(1)]],
      typeAttetion: ['', Validators.required]
    });

    this.f.dni.setValue("12312323");

    this.joinForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(1)]],
      typeAttetion: ['', Validators.required]
    });
  }

  get f() { return this.roomForm.controls; }
  get f1() { return this.joinForm.controls; }

  checkRoom() {
    if (this.roomForm.valid) {
      let patient = this.roomForm.value;
      patient['providerId'] = this.provider.id;
      this.authPatientService.joinValidatePatient(patient).subscribe((resultPatient) => {
        this.submitted = true;
        this.dialogRef.close({ resultPatient });
      }, error => {
        this.step = 2;
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
    this.submitted = true;
    if (this.joinForm.invalid) {
      return;
    }
    this.joinForm.value.phoneNumber = this.phoneNumber;
    let patient = this.joinForm.value;
    patient['providerId'] = this.provider.id
    this.authPatientService.join(patient)
      .subscribe(result => {
        if (result) {
          this.authPatientService.joinValidatePatient(result).subscribe(resultPatient => {
            this.dialogRef.close({ resultPatient });
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
