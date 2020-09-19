import { ActivatedRoute } from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FileUploadService} from "../../../_services/file-upload.service";
import {HttpErrorResponse, HttpEventType} from "@angular/common/http";
import {catchError, map} from "rxjs/operators";
import {of} from "rxjs";
import {AuthService} from "../../../_services/auth.service";
import {ProviderService} from "../../../_services/provider.service";
import {Consult} from "../../../_model/user";
import Swal from 'sweetalert2';



@Component({
  selector: 'app-new-consult',
  templateUrl: './new-consult.component.html',
  styleUrls: ['./new-consult.component.css']
})
export class NewConsultComponent implements OnInit {
  currentUser: any;
  data:any;
  iteralData:Consult;
  dataDisplay:boolean=false;
  fileName=[];
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; files = [] ;

  constructor(
    private activatedroute: ActivatedRoute, 
    private fileUploadService: FileUploadService,
    private authService:AuthService,
    private providerService:ProviderService
  ) {
    this.currentUser = this.authService.getCurrentUser;
    this.activatedroute.params.subscribe(data => {
      this.data=data;
    })
  }

  ngOnInit(): void {
    this.providerService.getOneConsult(this.currentUser.id, this.data.id, this.data.date)
    .subscribe(res=>{
      this.iteralData=res;
      this.fileName=this.iteralData.providerFiles;
      this.dataDisplay=true;
    })
  }
  
  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('_id', this.data.id);
    formData.append('key', 'newConsult');
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
  saveData(updateConsult){
    updateConsult.providerFiles=this.fileName;
    const updateData={
      providerId:this.currentUser.id,
      patientId:this.data.id,
      date:this.data.date,
      updateData:updateConsult
    }
    this.providerService.updateConsult(updateData)
    .subscribe(res=>{
      console.log(res)
      console.log(res)
      if(res==='success')
      Swal.fire('Updated successfully');
    })
  }

}
