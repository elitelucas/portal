import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {ProviderService} from "../../../_services/provider.service";
import { AuthPatientService } from '../../../_services/auth.patient.service';

@Component({
  selector: 'app-sign-in-patient',
  templateUrl: './sign-in-patient.component.html',
  styleUrls: ['./sign-in-patient.component.css']
})
export class SignInPatientComponent implements OnInit {
  step = 1;
  roomForm: FormGroup;
  joinForm: FormGroup;
  submitted = false;
  domain = environment.domain;
  dniData: any;
  roomData: any;
  isInvalidDomain: boolean = false;
  isValidRoom: boolean = true;

  isDuplicatedEmail: boolean = false;
  isEmptyPhoneNumber: boolean = false;
  isDuplicatedPhone: boolean = false;
  isValidNumber: boolean = true;
  isDuplicatedDNI: boolean = false;
  directRoomUrl : string = '';
  private phoneNumber: any;

  identify_patient = 'OK';
  no_identify_patient = 'NOK';

  constructor(private formBuilder: FormBuilder, private authPatientService: AuthPatientService,
              private router: Router, private providerService: ProviderService) { }

  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.roomForm = this.formBuilder.group({
      room: ['', [Validators.required ,Validators.minLength(this.domain.length+ 1)]],
      dni: ['', Validators.required]
    });
    
    this.f.dni.setValue("12312323");
    this.f.room.setValue(this.domain+"testroom2");
    // this.f.room.setValue(this.domain);

    this.joinForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      providerId: ['', Validators.required],
      room: ['', Validators.required],
      record: ['']
    }, );
  }

  get f() {return this.roomForm.controls;}
  get f1() {return this.joinForm.controls;}

  checkRoom() {
    localStorage.setItem('patient_auth', this.no_identify_patient);
    this.submitted = true;
    const room = this.f.room.value.substring(this.domain.length);
    const dniPatient = this.f.dni.value;
    // if(this.roomForm.invalid) {
    //   console.log('sssss')
    //   return;
    // }
    // if(!this.f.room.value.includes(this.domain)) {
    //   this.isInvalidDomain = true;
    //   return;
    // }
    this.providerService.checkRoomExist(room)
      .subscribe(result => {
        console.log('eee')
        if(result)   {
          this.providerService.getPatient(dniPatient, 'dni').subscribe(resultPatient  => {
            console.log("getPatients dni:", resultPatient)
            this.step = 2;
            this.submitted = false;
            this.dniData = dniPatient;
            this.roomData = result;
            this.directRoomUrl = '/' + this.roomData.room;

            if(resultPatient) {
              localStorage.setItem('patient_dni', this.dniData);
              localStorage.setItem('patient_auth', this.identify_patient);
              this.router.navigateByUrl(this.directRoomUrl);
              return;
            }

            this.f1.room.setValue(this.roomData.room);
            this.f1.dni.setValue(this.dniData);
            this.f1.providerId.setValue(this.roomData._id);

          });
        }
        else {
          this.isValidRoom = false;
        }
      });
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
    if(this.joinForm.invalid) {
      return;
    }
    this.joinForm.value.phoneNumber = this.phoneNumber;
    this.authPatientService.join(this.joinForm.value)
      .subscribe(result => {
        if(result) {
          localStorage.setItem('patient_dni', this.dniData);
          localStorage.setItem('patient_auth', this.identify_patient);
          this.router.navigateByUrl(this.directRoomUrl);
          this.step = 1
          this.dniData = null;
          this.roomData = null;
          this.directRoomUrl = null;
        }
      }, error => {
        if(error) {
          if(error.error) error.error.errors[0].field === "dni" ? this.isDuplicatedDNI = true: (error.error.errors[0].field === 'phoneNumber' ? this.isDuplicatedPhone = true: this.isDuplicatedEmail = true);
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
