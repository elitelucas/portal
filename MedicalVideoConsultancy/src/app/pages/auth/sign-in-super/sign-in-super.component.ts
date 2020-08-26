import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../../_services/auth.service";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {error} from "selenium-webdriver";

@Component({
  selector: 'app-sign-in-super',
  templateUrl: './sign-in-super.component.html',
  styleUrls: ['./sign-in-super.component.css']
})
export class SignInSuperComponent implements OnInit {

  authForm: FormGroup;
  isSubmitted  =  false;
  isLoginFailed: boolean = false;
  hasNotPermission: boolean = false;
  constructor(
    private authService: AuthService, private router: Router, private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.authForm  =  this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]]
    });
  }

  get formControls() { return this.authForm.controls; }

  signIn(){
    this.isSubmitted = true;
    if(this.authForm.invalid){
      return;
    }
    this.authService.signIn(this.authForm.value).subscribe((res: any)=> {
      if(res.token) {
        if(res.user.role === "SuperAdmin") {
          this.router.navigateByUrl('/dashboard/super');
        } else {
          this.hasNotPermission = true;
          this.router.navigateByUrl('/super')
        }
      }
    }, error => {
      this.isLoginFailed = true;
      this.router.navigateByUrl('/super')
      }
    );
  }

}
