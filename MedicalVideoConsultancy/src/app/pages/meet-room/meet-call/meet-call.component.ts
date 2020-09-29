import { Component, OnInit, ElementRef, ViewChild, NgZone, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from '../../../_services/provider.service';
import { MeetRoomService } from '../../../_services/meet-room.service';
import { Patient } from '../../../_model/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { timer, of } from 'rxjs';
import {HttpErrorResponse, HttpEventType} from "@angular/common/http";
import {catchError, map} from "rxjs/operators";

import {FileUploadService} from "../../../_services/file-upload.service";

@Component({
  selector: 'app-meet-call',
  templateUrl: './meet-call.component.html',
  styleUrls: ['./meet-call.component.css']
})
export class MeetCallComponent implements OnInit {
  roomChatForm: FormGroup;
  fileName=[];

  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; files = [] ;
  @ViewChild('localVideo') public localVideo: ElementRef;
  @ViewChild('remoteVideo') public remoteVideo: ElementRef;
  @ViewChild('chatText') public chatText: ElementRef;

  dniPatient = null;
  patientsEmail: any;

  public patient: Patient;
  public providerSocketId;

  constructor(private route: ActivatedRoute, private providerService: ProviderService,
    private meetRoomService: MeetRoomService, private _ngZone: NgZone, private _router: Router,
    private formBuilder: FormBuilder, private renderer: Renderer2,private fileUploadService: FileUploadService) {
    this.dniPatient = localStorage.getItem('patient_dni');
    this.roomChatForm = this.formBuilder.group({
      text: ['', Validators.required]
    });
  }

  get f() { return this.roomChatForm.controls; }

  async ngOnInit() {
    await this.loadPatient();
  }

  async ngAfterViewInit() {
    this.meetRoomService.setLocalElement(this.localVideo);
    this.meetRoomService.setRemoteElement(this.remoteVideo);
    this.meetRoomService.startLocalMediaVideo();
    /*this.meetRoomService.connect().subscribe(async (peerId) => {
      console.log("peerId");
      console.log(peerId);
      await timer(200).toPromise();
      this.meetRoomService.confirmConnectPatient(this.patient);
      this.meetRoomService.waitCallComplete().subscribe(async (data) => {
      });
    });*/
  }

  async loadPatient() {
    this.providerService.getPatient(this.dniPatient, 'dni').subscribe(async (patient: Patient) => {
      if (patient) {
        this.patient = patient;
      };
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
    //console.log(text)
    this.meetRoomService.sendtext(this.providerSocketId, "Patient: " + text);
  }
  
  uploadFile(file) {
    const providerId=JSON.parse(localStorage.getItem('patient_dni'));
    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('dni', providerId);
    file.inProgress = true;
    const fileType=file.data.type.split('/')[0];
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
        console.log('event')
        console.log(event)
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
        this.files.push({ data: file, inProgress: false, progress: 0});
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }
  handleDownload(){
    
  }

  /*trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', arg);
  }*/
}


