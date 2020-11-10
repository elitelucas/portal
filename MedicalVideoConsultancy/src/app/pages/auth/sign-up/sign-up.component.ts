import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { Router } from '@angular/router';

import {MustMatch} from "../../../_helpers/must-match.validator";
import {AuthService} from "../../../_services/auth.service";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class SignUpComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
duplicatedKey=false;

  isDuplicatedRoom: boolean = false;
  isPending: boolean = false;
  isDuplicatedEmail:boolean = false;
  isDuplicatedPhone: boolean = false;
  isValidNumber: boolean = true;
  isEmptyPhoneNumber: boolean = false;
  phoneNumber:string = '';
constructor(
  private formBuilder: FormBuilder, 
  private auth: AuthService,
  private router:Router
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email,Validators.maxLength(100)]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.auth.signUp(this.registerForm.value).subscribe(res=> {
    if(res==='duplicate'){
      this.duplicatedKey=true;
    }
      if(res.token) {
        this.router.navigateByUrl('/dashboard/health-provider');
      } else if(res.status == "409") {
        console.log('sdfsdf')
      }
    });
  }


  hasError(event: boolean) {
    this.isValidNumber = event;
  }
}
