import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SignInComponent} from "./sign-in/sign-in.component";
import {SignUpComponent} from "./sign-up/sign-up.component";
import {SignInPatientComponent} from "./sign-in-patient/sign-in-patient.component";
import {SignInSuperComponent} from "./sign-in-super/sign-in-super.component";
import {SmsVerifyComponent} from "./sms-verify/sms-verify.component";


const routes: Routes = [
  {
    path: '',
    component: SignInSuperComponent
  },

  {
    path: 'verify-email/:url',
    component: SignInComponent
  },

  {
    path: 'verify-sms/:url',
    component: SmsVerifyComponent
  },

  {
    path: 'sign-up/admin',
    component: SignUpComponent
  },

  {
    path: 'sign-up/provider',
    component: SignUpComponent
  },

  {
    path: 'sign-in',
    component: SignInComponent
  },

  {
    path: 'sign-in-patient',
    component: SignInPatientComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
