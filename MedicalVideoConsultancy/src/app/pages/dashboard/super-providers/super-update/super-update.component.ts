import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MustMatch} from "../../../../_helpers/must-match.validator";


@Component({
  selector: 'app-super-update',
  templateUrl: './super-update.component.html',
  styleUrls: ['./super-update.component.css']
})
export class SuperUpdateComponent implements OnInit {
  registerTitle:String;
  registerForm:FormGroup;
  submitted=false;
  isDuplicatedRoom: boolean = false;
  isPending: boolean = false;
  isDuplicatedEmail:boolean = false;
  isDuplicatedPhone: boolean = false;
  isValidNumber: boolean = true;
  isEmptyPhoneNumber: boolean = false;
  phoneNumber:string = '';
  formData:any;

  constructor(
    private route:ActivatedRoute,
    private formBuilder: FormBuilder,
    ) {
    this.route.params.subscribe(data=>{
      console.log('data')
      console.log(data)
      if(data.data==='new'){
        this.registerTitle="New"
      }else{
        this.registerTitle="Update";
        console.log('data.data')
        console.log(data.data)
        this.formData=JSON.parse(data.data);
      }
    })
   }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: [this.formData? this.formData.name.split(' ')[0]:'', [Validators.required,Validators.pattern("[a-zA-Z ]*"), Validators.maxLength(100)]],
      lastName: [this.formData? this.formData.name.split(' ')[1]:'', [Validators.required,Validators.pattern("[a-zA-Z ]*"),Validators.maxLength(100)]],
      room: [this.formData? this.formData.room:'', [Validators.required,Validators.pattern("[a-zA-Z ]*"), Validators.maxLength(40)]],
      cmp: [this.formData? this.formData.cmp:'', [Validators.required,Validators.pattern("[0-9]*"), Validators.minLength(4), Validators.maxLength(8)]],
      email: [this.formData? this.formData.email:'', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'),Validators.maxLength(100)]],
      phoneNumber: [this.formData? this.formData.phoneNumber:'', Validators.required],
      speciality: [this.formData? this.formData.speciality:'', Validators.required],
      password: [this.formData? this.formData.password:'', [Validators.required, Validators.minLength(8)]],
      confirmPassword: [this.formData? this.formData.password:'', Validators.required],
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }
  get f() { return this.registerForm.controls; }

  onSubmit(){
    this.submitted=true;
    this.isEmptyPhoneNumber = !this.registerForm.value.phoneNumber;
    // stop here if form is invalid
    if (this.registerForm.invalid || !this.isValidNumber || this.isEmptyPhoneNumber) {
      return;
    }
  }

  hasError(event: boolean) {
    this.isValidNumber = event;
  }

  getNumber(phoneNumber: any) {
    console.log("entered number>>>>>>>>",phoneNumber );
    this.phoneNumber = phoneNumber;
    return this.phoneNumber;
  }

  telInputObject(event: any) {
    console.log("input object >>>>>>>>>>", event)
  }

  onCountryChange(event: any) {
    console.log("change number >>>>>>>>>>>>>>", event)
  }

}
