import { PatientService } from './../../../_services/patient.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FileUploadService } from "../../../_services/file-upload.service";
import { HttpErrorResponse, HttpEventType } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { of } from "rxjs";
import { AuthService } from "../../../_services/auth.service";
import { ProviderService } from "../../../_services/provider.service";
import { Consult, Patient } from "../../../_model/user";
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DataService } from '../../../_services/data.service';
import { PreviewPrescriptionComponent } from './preview-prescription/preview-prescription.component';



@Component({
  selector: 'app-new-consult',
  templateUrl: './new-consult.component.html',
  styleUrls: ['./new-consult.component.css']
})
export class NewConsultComponent implements OnInit {
  haveAlergy: boolean = false;
  currentUser: any;
  data: any;
  iteralData: Consult;
  dataDisplay: boolean = false;
  fileName = [];
  classKey = [];
  upClassKey = [];
  downloadFile: String;

  symptons = [];

  @ViewChild("fileUpload", { static: false }) fileUpload: ElementRef; files = [];

  newConsult = null;
  patientAge = 0;

  patient;

  //publicUrl = environment.baseUrl + 'public/image/';

  prescriptions = [];
  message: any;
  prescriptionForm: FormGroup;
  submitted = false;
  base64data: any;

  constructor(
    public dialog: MatDialog,
    //private dataService: DataService,
    private providerService: ProviderService,
    //private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private activatedroute: ActivatedRoute,
    private fileUploadService: FileUploadService,
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router
  ) {

    console.log("NewConsultComponent");

    this.currentUser = this.authService.getCurrentUser;

    this.newConsult = localStorage.getItem("newConsult");
    if (this.newConsult)
      this.newConsult = JSON.parse(this.newConsult);

    this.data = localStorage.getItem("data_consult");
    console.log("this.data");
    console.log(this.data);
    if(this.data){
      this.data = JSON.parse(this.data);
    }else{
      this.activatedroute.params.subscribe(data => {
        this.data = data;
      })
    }

  }

  ngOnInit(): void {
    console.log("ngOnInit this.data");
    console.log(this.data);
    if (this.data.consultId) {
      this.providerService.getOneConsult(this.data.id, this.data.consultId)
        .subscribe(res => {
          console.log("res");
          console.log(res);
          this.iteralData = res;
          this.prescriptions = this.iteralData.prescriptions;
          this.fileName = this.iteralData.providerFiles;
          this.dataDisplay = true;
          this.patient = this.iteralData.patient;
          this.prescriptionForm = this.formBuilder.group({
            email: [this.patient.email, [Validators.required, Validators.email, Validators.maxLength(100)]]
          });
          this.getChart(this.iteralData.patient);
          let dateString = this.iteralData.patient['birthdate'] + 'T00:00:00'
          let newDate = new Date(dateString);
          let timeDiff = Math.abs(Date.now() - newDate.getTime());
          let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
          this.patientAge = age;
        })
    } else {
      this.iteralData = new Consult();
      this.providerService.getPatient(this.data.id, "id").subscribe((patient: Patient) => {
        let dateString = patient.birthdate + 'T00:00:00'
        let newDate = new Date(dateString);
        let timeDiff = Math.abs(Date.now() - newDate.getTime());
        let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
        this.patientAge = age;
        this.iteralData.patient = patient;
        this.patient = this.iteralData.patient;
        this.prescriptionForm = this.formBuilder.group({
          email: [this.patient.email, [Validators.required, Validators.email, Validators.maxLength(100)]]
        });
        this.patient = this.iteralData.patient;
        this.iteralData.timeOfDisease = '';
        this.iteralData.wayOfStart = '';
        this.iteralData.typeAttetion = this.newConsult.typeAttetion;
        this.iteralData.reason = this.newConsult.reason;
        this.iteralData.payment = this.newConsult.paySelect;
        this.iteralData.payAmount = this.newConsult.amount;
        this.dataDisplay = true;
        this.getChart(patient);
      });
    }
  }

  get f() { return this.prescriptionForm.controls; }

  getChart(patient): void {
    this.providerService.getChart(patient['dni']).subscribe(res => {
      if (res) {
        if (res.alergies) {
          if (res.alergies.length > 0) {
            this.haveAlergy = true
          }
        }
      }
    });
  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('_id', this.data.id);
    formData.append('key', 'newConsult');
    file.inProgress = true;
    const fileType = file.data.type.split('/')[0];
    this.fileUploadService.uploadFile(formData).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        return of(`${file.data.name} upload failed.`);
      })).subscribe((event: any) => {
        if (typeof (event) === 'object') {
          setTimeout(() => {
            file.inProgress = false;
            file.progress = 0;
            this.files = [];
          }, 1000);
          this.fileName.push(event.body)
        }
      });
  }

  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach(file => {
      this.uploadFile(file);
    });
  }

  handleUpload() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      for (const f of fileUpload.files) {
        const file = f;
        this.files.push({ data: file, inProgress: false, progress: 0 });
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }

  changeClass(idx, key) {
    if (key === 'down') {
      this.initClass();
      this.classKey[idx] = true;
      this.downloadFile = this.iteralData.patientFiles[idx];
    } else {
      this.initClass();
      this.upClassKey[idx] = true;
      this.downloadFile = this.fileName[idx];
    }
  }
  initClass() {
    this.classKey = [];
    this.upClassKey = [];
    this.iteralData.patientFiles.forEach((item) => {
      this.classKey.push(false);
    })
    this.fileName.forEach((item) => {
      this.upClassKey.push(false);
    })
  }

  handleDownload() {
    if (this.downloadFile) {
      this.patientService.download('provider/download/consult/' + this.downloadFile)
        .subscribe(blob => {
          saveAs(blob, this.downloadFile)
        })
    }
  }

  saveData(updateConsult) {
    updateConsult.providerFiles = this.fileName;
    updateConsult.symptons = this.symptons;
    updateConsult.payAmount = this.newConsult.amount;
    updateConsult.reason = this.newConsult.reason;
    updateConsult.typeAttetion = this.newConsult.typeAttetion;
    updateConsult.payment = this.newConsult.paySelect;
    updateConsult['prescriptions'] = this.prescriptions;
    const updateData = {
      patientId: this.data.id,
      consultId: this.data.consultId,
      providerId: this.currentUser.id,
      updateData: updateConsult
    }

    let msg = "Yes, save it!";
    let msgResult = "Created successfully";
    if (this.data.consultId) {
      msg = "Yes, update it!";
      msgResult = "Updated successfully";
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: msg
    }).then((result) => {
      if (result.isConfirmed) {
        this.providerService.updateConsult(updateData)
          .subscribe(res => {
            if (res) {
              Swal.fire(msgResult);
              localStorage.removeItem("newConsult");
            }
          })
      }
    });
  }

  cancel() {
    this.router.navigateByUrl('/dashboard/patient/' + this.data.id);
  }

  addItem(Item: string, key: string) {
    if (Item) {
      if (key === 'symptons')
        this.symptons.push(Item);
    }
  }

  deleteItem(idx, key) {
    if (key === 'symptons')
      this.symptons.splice(idx, 1);

  }

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

  previewPrescription() {
    this.submitted = true;
    //const email = this.f.email.value;

    if (this.prescriptionForm.invalid) {
      return;
    }

    this.providerService.getSignature(this.currentUser.id)
      .subscribe(res => {


        /*console.log('res')
        console.log(res)*/

        this.base64data = res;
        var prescriptionHtmlStr = '';
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        const prescriptionDate = dd + '/' + mm + '/' + yyyy;
        const dni = this.patient.dni;
        const providerName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
        /*const from = this.currentUser.email;
        const subject = "Medical Prescription";*/
        this.prescriptions.forEach((item, idx) => {
          prescriptionHtmlStr += '<p>' + (idx + 1) + '. ' + item + '</p>';
        })
        const sendHtmlStr = '<div style="padding: 2%;width:70%;margin:auto">' +
          '<div style="text-align: center;"><h2><i class="fa fa-star"></i>MEVICO-MEDICAL PRESCRIPTION</h2>' +
          '</div>' +
          '<div>' +
          '<span style="float: left;">Name : ' + this.patient.fullName + ' </span>' +
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
        console.log('this.prescriptions');
        console.log(this.prescriptions);
        console.log('sendHtmlStr');
        console.log(sendHtmlStr);
        const dialogRef = this.dialog.open(PreviewPrescriptionComponent, {
          width: '75%',
          height: '70%',
          data: sendHtmlStr
        });
      });

  }

  sendPrescription() {
    this.submitted = true;
    const email = this.f.email.value;

    if (this.prescriptionForm.invalid) {
      return;
    }

    this.providerService.getSignature(this.currentUser.id)
      .subscribe(res => {
        if (res) {
          this.base64data = res;
          var prescriptionHtmlStr = '';
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0');
          var yyyy = today.getFullYear();
          const prescriptionDate = dd + '/' + mm + '/' + yyyy;
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
          Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
          }).then((result) => {
            this.providerService.sendMail(from, email, subject, sendHtmlStr).subscribe(result => {
              console.log('result');
              console.log(result);
            })
          });

        } else {
          Swal.fire('There is no doctor signature. Please upload the signature.')
        }
      });
  }

}
