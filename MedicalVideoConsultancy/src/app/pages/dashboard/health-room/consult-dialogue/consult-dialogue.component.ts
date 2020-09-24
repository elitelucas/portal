import { ActivatedRoute } from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild,Inject} from '@angular/core';
import {FileUploadService} from "../../../../_services/file-upload.service";
import {HttpErrorResponse, HttpEventType} from "@angular/common/http";
import {catchError, map} from "rxjs/operators";
import {of} from "rxjs";
import {AuthService} from "../../../../_services/auth.service";
import {ProviderService} from "../../../../_services/provider.service";
import {Consult} from "../../../../_model/user";
import Swal from 'sweetalert2';
import { ConsultsComponent } from './../consults/consults.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";
import { PatientService } from './../../../../_services/patient.service';
import { saveAs } from 'file-saver';



@Component({
  selector: 'app-consult-dialogue',
  templateUrl: './consult-dialogue.component.html',
  styleUrls: ['./consult-dialogue.component.css']
})
export class ConsultDialogueComponent implements OnInit {
  currentUser: any;
  data:any;
  iteralData:Consult;
  dataDisplay:boolean=false;
  fileName=[];
  classKey=[];
  upClassKey=[];
  downloadFile:String;
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; files = [] ;

  constructor(
    private activatedroute: ActivatedRoute, 
    private fileUploadService: FileUploadService,
    private authService:AuthService,
    private providerService:ProviderService,
    private patientService:PatientService,
    public dialogRef: MatDialogRef<ConsultsComponent>,
    @Inject(MAT_DIALOG_DATA) public receiveData
  ) {
    console.log('receiveData')
    console.log(receiveData)
    this.currentUser = this.authService.getCurrentUser;
    this.activatedroute.params.subscribe(data => {
      this.data=receiveData;
      console.log('this.data')
      console.log(this.data)
    })
  }

  ngOnInit(): void {
    this.providerService.getOneConsult(this.data.id, this.data.consultId)
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
  changeClass(idx,key){
    if(key==='down'){
      this.initClass();
      this.classKey[idx]=true;
      this.downloadFile=this.iteralData.patientFiles[idx];
      }else{
        this.initClass();
        this.upClassKey[idx]=true;
        this.downloadFile=this.fileName[idx];
      }
    }
    initClass(){
      this.classKey=[];
      this.upClassKey=[];
      this.iteralData.patientFiles.forEach((item)=>{
        this.classKey.push(false);
      })
      this.fileName.forEach((item)=>{
        this.upClassKey.push(false);
      })
    }
   
  handleDownload(){
    console.log('this.downloadFile')
    console.log(this.downloadFile)
    if(this.downloadFile){
      this.patientService.download('file-transfer/download/consult/'+this.downloadFile)
      .subscribe(blob =>{
        saveAs(blob, this.downloadFile)} )
    }  
  }

  saveData(updateConsult){
    updateConsult.providerFiles=this.fileName;
    const updateData={
      patientId:this.data.id,
      consultId:this.data.consultId,
      updateData:updateConsult
    }
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.providerService.updateConsult(updateData)
        .subscribe(res=>{
          if(res){
            Swal.fire('Updated successfully');
            this.dialogRef.close();
          }
        })
      }
    })
  }
  Cancel(){
    this.dialogRef.close();
  }

}

