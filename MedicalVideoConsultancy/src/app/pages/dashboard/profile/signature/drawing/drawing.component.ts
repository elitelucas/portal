import { Component, Input, ViewChild, OnInit, HostListener,ElementRef } from '@angular/core';
import { DataService } from "../../../../../_services/data.service";
import {AuthService} from "../../../../../_services/auth.service";
import {FileUploadService} from "../../../../../_services/file-upload.service";
import {environment} from "../../../../../../environments/environment";

import {catchError, map} from "rxjs/operators";
import {HttpErrorResponse, HttpEventType} from "@angular/common/http";
import {of} from "rxjs";
import { UserService } from './../../../../../_services/user.service';
import  Swal  from 'sweetalert2';


@Component({
  selector: 'drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css']
})
export class DrawingComponent implements OnInit {
  currentUser: any;
  @Input() name: string;
  @ViewChild('sigPad') sigPad;
  @ViewChild('blank') blank;
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; files = [] ;
  publicUrl = environment.baseUrl + "public/image/";

  sigPadElement;
  blankElement;
  context;
  isDrawing = false;
  img;
  sigImgKey=false;
  message:string;
  userData: any;
  switch:boolean=false;
  constructor(
    private data: DataService,
    private authService:AuthService,
    private fileUploadService:FileUploadService,
    private userService:UserService
    ){
    this.currentUser = this.authService.getCurrentUser;
  }

  ngOnInit() {
    this.userService.getSignature(this.currentUser.id).subscribe(res=>{
      if(res){
        this.sigImgKey=true;
        this.img=this.publicUrl+res;
      }
    })
  }

  ngAfterViewInit() {
    this.sigPadElement = this.sigPad.nativeElement;
    this.blankElement=this.blank.nativeElement;

    this.context = this.sigPadElement.getContext('2d');
 
    this.context.strokeStyle = '#3742fa';
    this.context.fillStyle = '#3742fa';

   
    var parent = document.getElementById("parent");
    this.sigPadElement.width = parent.clientWidth;
    this.blankElement.width = parent.clientWidth;
  }


  @HostListener('document:mouseup', ['$event'])
  onMouseUp(e) {
    this.isDrawing = false;
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const coords = this.relativeCoords(e);
    this.context.moveTo(coords.x, coords.y);
  }

  onMouseMove(e) {
    if (this.isDrawing) {
      const coords = this.relativeCoords(e);
      this.context.lineTo(coords.x, coords.y);
      this.context.stroke();
    }
  }
  onResize(event){
      this.sigPadElement.width = event.target.innerWidth*0.7;
      this.blankElement.width = event.target.innerWidth*0.7;
  }

  private relativeCoords(event) {
  
    const bounds = event.target.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    return { x: x, y: y };
  }

  clear() {
    this.switch=false;
    this.context.clearRect(0, 0, this.sigPadElement.width, this.sigPadElement.height);
    this.context.beginPath();
    
  }

  save() {  
    if(this.switch){
      this.userService.updateSignature(this.userData.fileName,this.currentUser.id).subscribe(res=>{
        if(res)
        Swal.fire('Updated successfully');
      })
    }else{
      if(this.sigPadElement.toDataURL() === this.blankElement.toDataURL()){
        Swal.fire('There is no new signature.Please draw signature.');
        return;
      } 
      this.sigImgKey=true;
      this.img = this.sigPadElement.toDataURL("image/png");
      this.userService.updateSignature(this.img,this.currentUser.id).subscribe(res=>{
        if(res)
        Swal.fire('Updated successfully');
      })
    }
    // this.data.changeMessage(this.img);
  }
  
  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('_id', this.currentUser.id);
    file.inProgress = true;
    this.fileUploadService.sigImgUpload(formData).pipe(
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
        this.userData = event.body;
        this.switch=true;
        // this.data.changeMessage(this.userData.fileName);
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

}
