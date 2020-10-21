import { Component, OnInit, ElementRef, ViewChild, NgZone, Renderer2, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { ProviderService } from '../../../_services/provider.service';
import { MeetRoomService } from '../../../_services/meet-room.service';
import { Patient } from '../../../_model/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { timer, of, Subject } from 'rxjs';
import { HttpErrorResponse, HttpEventType } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { PatientService } from './../../../_services/patient.service';
import { FileUploadService } from "../../../_services/file-upload.service";
import { saveAs } from 'file-saver'
import { MeetRoomPatientService } from '../../../_services/meet-room-patient.service';

@Component({
  selector: 'app-meet-call',
  templateUrl: './meet-call.component.html',
  styleUrls: ['./meet-call.component.css']
})
export class MeetCallComponent implements OnInit {

  @ViewChild("fileUpload", { static: false }) fileUpload: ElementRef; files = [];
  @ViewChild('localVideo') public localVideo: ElementRef;
  @ViewChild('remoteVideo') public remoteVideo: ElementRef;
  @ViewChild('chatText') public chatText: ElementRef;

  @Input() patientData: any;
  @Input() providerData: any;
  @Input() roomName: any;

  roomChatForm: FormGroup;
  fileName = [];
  downloadFileList = [];
  classKey = [];
  upClassKey = [];
  downloadFile: string;

  constructor(
    private meetRoomPatientService: MeetRoomPatientService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private patientService: PatientService
  ) {
    this.roomChatForm = this.formBuilder.group({
      text: ['', Validators.required]
    });
  }

  get f() { return this.roomChatForm.controls; }

  async ngOnInit() {
    /*this.providerService.checkRoomExist(this.roomName).subscribe(result => {
      if (result) {
        this.providerData = result;
      }
    });*/
  }

  async ngAfterViewInit() {
    this.meetRoomPatientService.confirmConnectPatient(this.patientData);
    this.meetRoomPatientService.setLocalElement(this.localVideo);
    this.meetRoomPatientService.setRemoteElement(this.remoteVideo);
    this.meetRoomPatientService.startLocalMediaVideo();
    this.meetRoomPatientService.preparateVideoCallFormProviderListener().subscribe(provider => {
      this.providerData = provider;
      this.meetRoomPatientService.connect().subscribe(peerId => {
        this.patientData.peerId = peerId;
        this.meetRoomPatientService.preparateVideoCallFormPatient(this.providerData, this.patientData);
      });
    });
    this.meetRoomPatientService.receiveUploadFile().subscribe(uploadFileName => {
      this.downloadFileList.push(uploadFileName);
    });


    this.meetRoomPatientService.recivetext().subscribe((text) => {
      const p = this.renderer.createElement('p');
      const d = this.renderer.createText(text);
      this.renderer.appendChild(p, d);
      this.renderer.appendChild(this.chatText.nativeElement, p);
    });
  }

  public sendText() {
    const text = this.f.text.value;
    this.meetRoomPatientService.sendtext(this.providerData.socketId, "Patient: " + text);
  }

  public mute() {
    this.meetRoomPatientService.localMuteActive(true);
  }

  public desmute() {
    this.meetRoomPatientService.localMuteActive(false);
  }

  public videomute() {
    this.meetRoomPatientService.localVideoActive(true);
  }

  public videodesmute() {
    this.meetRoomPatientService.localVideoActive(false);
  }

  uploadFile(file) {
    const dni = JSON.parse(localStorage.getItem('patient_dni'));
    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('dni', dni);
    formData.append('key', 'patient');
    file.inProgress = true;
    const fileType = file.data.type.split('/')[0];
    this.patientService.uploadFile(formData).pipe(
      map(event => {
        /*console.log('event')
        console.log(event)*/
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
        console.log('event')
        console.log(event)
        if (typeof (event) === 'object') {
          setTimeout(() => {
            file.inProgress = false;
            file.progress = 0;
            this.files = [];
          }, 1000);
          this.fileName.push(event.body)
          this.meetRoomPatientService.sendUploadFile(event.body, 'patient', this.providerData._id);
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
      this.downloadFile = this.downloadFileList[idx];
    } else {
      this.initClass();
      this.upClassKey[idx] = true;
      this.downloadFile = this.fileName[idx];
    }
  }

  initClass() {
    this.classKey = [];
    this.upClassKey = [];
    this.downloadFileList.forEach((item) => {
      this.classKey.push(false);
    })
    this.fileName.forEach((item) => {
      this.upClassKey.push(false);
    })
  }

  handleDownload() {
    if (this.downloadFile) {
      this.patientService.download('file-transfer/download/consult/' + this.downloadFile)
        .subscribe(blob => {
          saveAs(blob, this.downloadFile)
        })
    }
  }

}


