import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AuthService } from '../../../../../_services/auth.service';
import { UserService } from '../../../../../_services/user.service';
import { ConsultListComponent } from '../consult-list.component';

export interface PayData {
  QRimg: object[];
  account: string[];
  url: string[];
  payAmount: string;
}

@Component({
  selector: 'app-add-consult',
  templateUrl: './add-consult.component.html',
  styleUrls: ['./add-consult.component.css']
})
export class AddConsultComponent implements OnInit {

  currentUser = null;
  patient = null;
  payData: PayData;
  QRimgKey = [];
  accountKey = false;
  urlKey = false;
  payForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ConsultListComponent>,
    private authService: AuthService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.currentUser = this.authService.getCurrentUser;
    this.patient = data;

    this.payForm = this.formBuilder.group({
      amount: ['', [Validators.required]],
      paySelect: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(1)]],
      typeAttetion: ['', Validators.required]
    });
  }

  ngOnInit(): void {

    this.userService.getPayData(this.currentUser.id).subscribe(res => {
      this.payData = res;
      if (res === null || res.length === 0) {
        this.payData = {
          QRimg: [],
          account: [],
          url: [],
          payAmount: ''
        }
      }
      if (this.payData) {
        if (this.payData.QRimg) {
          if (this.payData.QRimg[0]) {
            this.QRimgKey[0] = true;
          }
          if (this.payData.QRimg[1]) {
            this.QRimgKey[1] = true;
          }
        } else {
          this.payData.QRimg = [];
        }
        if (this.payData.account) {
          this.accountKey = true;
        } else {
          this.payData.account = [];
        }
        if (this.payData.url) {
          this.urlKey = true;
        } else {
          this.payData.url = []
        }
      }
    })


  }

  confirmPay() {
    if (this.payForm.invalid) {
      console.log(this.payForm.valid);
      console.log(this.payForm.value);
      return;
    }
    this.dialogRef.close(this.payForm.value);
  }

  cancel() {
    this.dialogRef.close();
  }

}
