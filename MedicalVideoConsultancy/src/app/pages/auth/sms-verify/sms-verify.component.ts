import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../_services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-sms-verify',
  templateUrl: './sms-verify.component.html',
  styleUrls: ['./sms-verify.component.css']
})
export class SmsVerifyComponent implements OnInit {
  smsForm: FormGroup;
  isSubmitted  =  false;
  isVerifyFailed: boolean = false;
  fakeToken: string;
  constructor(
    private authService: AuthService, private router: Router, private formBuilder: FormBuilder, private route: ActivatedRoute
  ) { this.fakeToken = this.route.snapshot.params.url; console.log("snap shot for fake number", this.fakeToken)}

  ngOnInit(): void {
    this.smsForm  =  this.formBuilder.group({
      smsCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  get formControls() { return this.smsForm.controls; }

  smsVerify(){
    this.isSubmitted = true;
    if(this.smsForm.invalid){
      return;
    }
    if(!this.fakeToken) return;
    this.authService.smsVerify(this.smsForm.value, this.fakeToken).subscribe(res=> {
      console.log("verification success sms", res);
      if(res.status === "active") {
        this.router.navigateByUrl('/auth/sign-in');
      }
    });
  }
}
