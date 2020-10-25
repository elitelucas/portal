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

  constructor(
    private activatedroute: ActivatedRoute,
    private fileUploadService: FileUploadService,
    private authService: AuthService,
    private providerService: ProviderService,
    private patientService: PatientService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser;
    this.newConsult = localStorage.getItem("newConsult");
    this.newConsult = JSON.parse(this.newConsult);
    this.activatedroute.params.subscribe(data => {
      this.data = data;
    })
  }

  ngOnInit(): void {
    if (this.data.consultId) {
      this.providerService.getOneConsult(this.data.id, this.data.consultId)
        .subscribe(res => {
          this.iteralData = res;
          this.fileName = this.iteralData.providerFiles;
          this.dataDisplay = true;
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

}
