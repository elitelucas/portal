import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2TelInputModule } from "ng2-tel-input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AuthRoutingModule } from './auth-routing.module';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInPatientComponent } from './sign-in-patient/sign-in-patient.component';
import { SignInSuperComponent } from './sign-in-super/sign-in-super.component';
import { SmsVerifyComponent } from './sms-verify/sms-verify.component';
import { MatInputModule } from "@angular/material";


@NgModule({
  declarations: [SignInComponent, SignUpComponent, SignInPatientComponent, SignInSuperComponent, SmsVerifyComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    Ng2TelInputModule
  ]
})
export class AuthModule { }
