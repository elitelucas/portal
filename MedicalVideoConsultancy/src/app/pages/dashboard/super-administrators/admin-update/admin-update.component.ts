import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from './../../../../_services/user.service';
import {MustMatch} from "../../../../_helpers/must-match.validator";
import  Swal  from 'sweetalert2';



@Component({
  selector: 'app-admin-update',
  templateUrl: './admin-update.component.html',
  styleUrls: ['./admin-update.component.css']
})
export class AdminUpdateComponent implements OnInit {
  registerTitle:String;
  registerForm:FormGroup;
  passwordForm:FormGroup;
  submitted=false;
  passSubmitted=false;
  isDuplicatedPhone: boolean = false;
  isValidNumber: boolean = true;
  isEmptyPhoneNumber: boolean = false;
  phoneNumber:string = '';
  formData:any;
  userId:any;

  constructor(
    private route:ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService:UserService
    ) {
      
    this.route.params.subscribe(data=>{
      if(data.data==='new'){
        this.registerTitle="New"
      }else{
        this.registerTitle="Update";
        this.userService.getAdminById(data.data).subscribe(res=>{
          console.log('res')
          console.log(res)
          this.formData=res;
          this.userId=this.formData._id;
          this.registerForm = this.formBuilder.group({
            firstName: [this.formData? this.formData.firstName:'', [Validators.required,Validators.pattern("[a-zA-Z ]*"), Validators.maxLength(100)]],
            lastName: [this.formData? this.formData.lastName:'', [Validators.required,Validators.pattern("[a-zA-Z ]*"),Validators.maxLength(100)]],
            email: [this.formData? this.formData.email:'', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'),Validators.maxLength(100)]],
            phoneNumber: [this.formData? this.formData.phoneNumber:'', Validators.required],
          });
        })
      }
    })
   }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: [this.formData? this.formData.firstName:'', [Validators.required,Validators.pattern("[a-zA-Z ]*"), Validators.maxLength(100)]],
      lastName: [this.formData? this.formData.lastName:'', [Validators.required,Validators.pattern("[a-zA-Z ]*"),Validators.maxLength(100)]],
      email: [this.formData? this.formData.email:'', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'),Validators.maxLength(100)]],
      phoneNumber: [this.formData? this.formData.phoneNumber:'', Validators.required],
    });

    this.passwordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }
  get f() { return this.registerForm.controls; }
  get f1() { return this.passwordForm.controls; }


  onSubmit(){
    this.submitted=true;
    this.isEmptyPhoneNumber = !this.registerForm.value.phoneNumber;
    // stop here if form is invalid
    if (this.registerForm.invalid || !this.isValidNumber || this.isEmptyPhoneNumber) {
      return;
    }

    if(this.formData){
      this.userService.updateProfile(this.registerForm.value,this.userId).subscribe(res=>{
        if(res){
          Swal.fire('Updated Successfully!')
          this.submitted=false;
                  
        }
      })
    }else{
      this.userService.createAdmin(this.registerForm.value).subscribe(res=>{
        if(res){
          this.userId=res._id;
          Swal.fire('Inserted Successfully!')
          this.submitted=false;
        }
      })
    }
  }

  onPassSubmit(){
    this.passSubmitted=true;
    if (this.passwordForm.invalid) {
      return;
    }
    if(this.userId){
      this.userService.updateProfile(this.passwordForm.value,this.userId).subscribe(res=>{
        if(res){
          Swal.fire('Updated Successfully!')
          this.passSubmitted=false;
        }
      })
    }else{
      Swal.fire('Please Register First!')
    }
  }
  onReset(){
    this.submitted = false;
    this.isDuplicatedPhone = false;
    this.isValidNumber = true;
    this.isEmptyPhoneNumber = false;
    this.registerForm.reset();
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

