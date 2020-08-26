import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
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
  isDuplicatedRoom: boolean = false;
  isPending: boolean = false;
  isDuplicatedEmail:boolean = false;
  isDuplicatedPhone: boolean = false;
  isValidNumber: boolean = true;
  isEmptyPhoneNumber: boolean = false;
  phoneNumber:string = '';
constructor(private formBuilder: FormBuilder, private auth: AuthService) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      room: ['', Validators.required],
      cmp: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.isEmptyPhoneNumber = !this.registerForm.value.phoneNumber;
    // stop here if form is invalid
    if (this.registerForm.invalid || !this.isValidNumber || this.isEmptyPhoneNumber) {
      return;
    }
    this.registerForm.value.phoneNumber = this.phoneNumber;
    const dataNewUser = this.registerForm.value;
    dataNewUser['role'] = 'Dr';
    console.log(dataNewUser);
    this.auth.signUp(this.registerForm.value).subscribe(res=> {
      if(res.token) {
        this.onReset();
        this.isPending = true;
      } else if(res.status == "409") {
        res.errors[0].field == "room" ? this.isDuplicatedRoom = true: (res.errors[0].field == 'phoneNumber' ? this.isDuplicatedPhone = true: this.isDuplicatedEmail = true);
      }
    });
  }

  onReset() {
    this.submitted = false;
    this.isPending = false;
    this.isDuplicatedEmail = false;
    this.isDuplicatedRoom = false;
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
