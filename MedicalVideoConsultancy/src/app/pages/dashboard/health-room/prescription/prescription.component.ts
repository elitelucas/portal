import { Component, OnInit } from '@angular/core';
import { DataService } from "../../../../_services/data.service";
import { ProviderService } from "../../../../_services/provider.service";
import { User, Patient } from '../../../../_model/user';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from "../../../../../environments/environment";
import Swal from 'sweetalert2';


@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {
  publicUrl = environment.baseUrl + 'public/image/';

  prescriptions = [];
  message: any;
  patient: Patient;
  currentUser: any;
  prescriptionForm: FormGroup;
  submitted = false;
  base64data: any;
  constructor(
    private data: DataService,
    private providerService: ProviderService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    this.route.paramMap.subscribe(async (params) => {
      this.patient = JSON.parse(localStorage.getItem(params.get("patientId")));
    });
    this.currentUser = JSON.parse(localStorage.getItem('provider_data'));
    /*console.log('this.currentUser')
    console.log(this.currentUser)*/
  }

  ngOnInit(): void {
    this.data.currentMessage.subscribe(message => {
      this.message = message
    })
    this.prescriptionForm = this.formBuilder.group({
      email: [this.patient.email, [Validators.required, Validators.email, Validators.maxLength(100)]]
    });
  }
  get f() { return this.prescriptionForm.controls; }


  AddPrescription(prescriptionInput: string) {
    if (prescriptionInput) {
      this.prescriptions.push(prescriptionInput);
    }
  }
  DeleteItem(idx) {
    this.prescriptions.splice(idx, 1);
  }
  sendBlob() {

  }
  sendPrescription() {
    this.submitted = true;
    const email = this.f.email.value;

    if (this.prescriptionForm.invalid) {
      return;
    }

    this.providerService.getSignature(this.currentUser.id)
      .subscribe(res => {
        // const blobToBase64 = blob => {
        //   const reader = new FileReader();
        //   reader.readAsDataURL(blob);
        //   return new Promise(resolve => {
        //     reader.onloadend = () => {
        //       resolve(reader.result);
        //     };
        //   });
        // };

        // blobToBase64(blob).then(base64data => {
        if (res) {
          this.base64data = res;

          var prescriptionHtmlStr = '';
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = today.getFullYear();
          const prescriptionDate = dd + '/'+  mm + '/' + yyyy;
          const dni = this.patient.dni;
          const providerName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
          const from = this.currentUser.email;
          const subject = "Medical Prescription";

          this.prescriptions.forEach((item, idx) => {
            prescriptionHtmlStr += '<p>' + (idx + 1) + '. ' + item + '</p>';
          })
          const sendHtmlStr = '<div style="padding: 2%;width:70%;margin:auto">' +
            '<div style="text-align: center;"><h2><i class="fa fa-star"></i>MEVICO-MEDICAL PRESCRIPTION</h2>' +
            '</div>' +
            '<div>' +
            '<span style="float: left;">Name : ' + this.patient.fullName + ' </span>'
            '<span style="float: right;">Date: ' + prescriptionDate + '</span>' +
            '</div>' +
            '</br>' +
            '<div style="margin-top: 50px;">DNI:' + dni +
            '</div>' +
            '<div>' + prescriptionHtmlStr + '</div>' +
            '<div style="text-align:center">' +
            '<div style="border-bottom: 1px solid; width:40%; margin:auto">' +
            '<img src="' + this.base64data + '" style="width:100%">' +
            '</div></br>' +
            '<div>' +
            '<p>Dr.' + providerName + '</p>' +
            '<p>CMP-' + this.currentUser.cmp + '</p>' +
            '</div>' +
            '</div>' +
            '</div>';
          console.log('this.prescriptions')
          console.log(this.prescriptions)
          this.providerService.sendMail(from, email, subject, sendHtmlStr).subscribe(result => {
            console.log('result');
            console.log(result);
          })
        } else {
          Swal.fire('There is no doctor signature. Please upload the signature.')
        }
        // });
      });

  }

}
