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
    private providerService: ProviderService,
    private meetRoomService: MeetRoomService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2, private fileUploadService: FileUploadService,
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
    this.meetRoomService.confirmConnectPatient(this.patientData);
    this.meetRoomService.setLocalElement(this.localVideo);
    this.meetRoomService.setRemoteElement(this.remoteVideo);
    this.meetRoomService.startLocalMediaVideo();    
    this.meetRoomService.preparateVideoCallFormProviderListener().subscribe(provider => {
      this.providerData = provider;
      this.meetRoomService.connect().subscribe(peerId => {
        this.patientData.peerId = peerId;
        this.meetRoomService.preparateVideoCallFormPatient(this.providerData, this.patientData);
      });
    });
    this.meetRoomService.receiveUploadFile().subscribe(uploadFileName => {
      this.downloadFileList.push(uploadFileName);
    });


    this.meetRoomService.recivetext().subscribe((text) => {
      const p = this.renderer.createElement('p');
      const d = this.renderer.createText(text);
      this.renderer.appendChild(p, d);
      this.renderer.appendChild(this.chatText.nativeElement, p);
    });
  }

  public sendText() {
    const text = this.f.text.value;
    this.meetRoomService.sendtext(this.providerData.socketId, "Patient: " + text);
  }

  public mute() {
    this.meetRoomService.localMuteActive(true);
  }

  public desmute() {
    this.meetRoomService.localMuteActive(false);
  }

  public videomute() {
    this.meetRoomService.localVideoActive(true);
  }

  public videodesmute() {
    this.meetRoomService.localVideoActive(false);
  }

  uploadFile(file) {
    const dni = JSON.parse(localStorage.getItem('patient_dni'));
    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('dni', dni);
    formData.append('key', 'patient');
    file.inProgress = true;
    const fileType = file.data.type.split('/')[0];
    this.fileUploadService.uploadFile(formData).pipe(
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
          this.meetRoomService.sendUploadFile(event.body, 'patient', this.providerData._id);
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


