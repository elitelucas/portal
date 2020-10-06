import { Patient } from './../../../_model/user';
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {ProviderService} from "../../../_services/provider.service";
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
  dniData: any;
  roomData: any;
  isInvalidDomain: boolean = false;
  isValidRoom: boolean = true;
  verifyKey=false;
  patientData:Patient;
  roomName;
  dniPatient;

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
      dni: ['', [Validators.required,Validators.pattern('[0-9]*'),Validators.minLength(8)]],
    });

    this.enterForm = this.formBuilder.group({
      room: ['', [Validators.required ,Validators.minLength(this.domain.length+ 1)]],
      dni: ['', [Validators.required,Validators.pattern('[0-9]*'),Validators.minLength(8)]],
      reason:'',
      gender:['newConsult',Validators.required],
      firstName:['',Validators.required],
      lastName:['',Validators.required],
      email:['',[Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'),Validators.required]],
      phoneNumber:['',Validators.required],

    });
    
    console.log(this.domain+"testroom2");
    this.f.dni.setValue("12312323");
    this.f.room.setValue(this.domain+"testroom2");

    // this.f2.dni.setValue("12312323");
    // this.f2.room.setValue(this.domain+"testroom2");
    // this.f.room.setValue(this.domain);

    this.joinForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      providerId: ['', Validators.required],
      room: ['', Validators.required],
      record: [''],
    }, );
  }

  get f() {return this.roomForm.controls;}
  get f1() {return this.joinForm.controls;}
  get f2() {return this.enterForm.controls;}


  checkRoom() {
    localStorage.setItem('patient_auth', this.no_identify_patient);
    this.submitted = true;
    if(this.roomForm.invalid)
    return;

    this.roomName= this.f.room.value.substring(this.domain.length);
    this.dniPatient = this.f.dni.value;

    this.providerService.checkRoomExist(this.roomName)
    .subscribe(result => {
      if(result)   {
        this.providerService.checkPatient(this.dniPatient)
        .subscribe(res=>{
          console.log('res')
          console.log(res)
          if(res!=='fail'){
            this.verifyKey=true;
            this.patientData=res;
            const firstName=this.patientData.fullName.split(' ')[0];
            const lastName=this.patientData.fullName.split(' ')[1];
            this.f2.dni.setValue(this.patientData.dni);
            this.f2.room.setValue(this.domain+this.patientData.room);
            this.f2.firstName.setValue(firstName)
            this.f2.lastName.setValue(lastName)
            this.f2.email.setValue(this.patientData.email)
            this.f2.phoneNumber.setValue(this.patientData.phoneNumber)
          }else{
            Swal.fire('No such dni.Please Insert.')
            this.verifyKey=true;
          }
        })
      
      }
      else {
        this.isValidRoom = false;
      }
    });
    
    return;
  
  }
  enterRoom(){
    this.entered=true;
    if(this.enterForm.invalid)
    return;
    const dni=this.f2.dni.value;
    var room=this.f2.room.value;
    if(room.indexOf('/')!==-1){
      room=room.split('/')[1];
    }
    const newConsult = this.f2.gender.value;
    const reason = this.f2.reason.value;
    const firstName= this.f2.firstName.value;
    const lastName= this.f2.lastName.value;
    const email= this.f2.email.value;
    const phoneNumber= this.f2.phoneNumber.value;
    const updateData={
      dni,
      room,
      newConsult,
      reason,
      firstName,
      lastName,
      email,
      phoneNumber
    }

    this.providerService.postPatient(updateData)
    .subscribe(res=>{
     
        Swal.fire('Send successfully.')
          // this.providerService.getPatient(dniPatient, 'dni').subscribe(resultPatient  => {
        //   console.log("getPatients dni:", resultPatient)
        //   this.step = 2;
        //   this.submitted = false;
        //   this.dniData = dniPatient;
          this.roomData = res;
          this.directRoomUrl = '/' + this.roomData.room;

         
            localStorage.setItem('patient_dni', this.roomData.dni);
            localStorage.setItem('patient_auth', this.identify_patient);
            this.router.navigateByUrl(this.directRoomUrl);
            return;
         

        //   this.f1.room.setValue(this.roomData.room);
        //   this.f1.dni.setValue(this.dniData);
        //   this.f1.providerId.setValue(this.roomData._id);

        // });
    
    })

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
