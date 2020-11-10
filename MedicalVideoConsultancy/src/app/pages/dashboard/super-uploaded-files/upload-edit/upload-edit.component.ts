import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from './../../../../_services/user.service';
import { ProviderService } from './../../../../_services/provider.service';
import {MustMatch} from "../../../../_helpers/must-match.validator";
import { HttpErrorResponse, HttpEventType } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { of } from "rxjs";
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';



@Component({
  selector: 'app-upload-edit',
  templateUrl: './upload-edit.component.html',
  styleUrls: ['./upload-edit.component.css']
})
export class UploadEditComponent implements OnInit {
  registerTitle:String;
  registerForm:FormGroup;
  passwordForm:FormGroup;
  submitted=false;
  passSubmitted=false;
  isDuplicatedPhone: boolean = false;
  isValidNumber: boolean = true;
  isEmptyPhoneNumber: boolean = false;
  phoneNumber:string = '';
  formData:any;
  userId:any;
  selectValue:any;

  allFileData:any;
  typeData:any;
  fileName:any;
  fileId:any;
  fileType:any;
  fileStatus:any;
  reportFile:any;

  @ViewChild("fileUpload", { static: false }) fileUpload: ElementRef; files = [];

  constructor(
    private route:ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService:UserService,
    private providerService:ProviderService
    ) {
      
    this.route.params.subscribe(data=>{
      if(data.data==='new'){
        this.registerTitle="New"
      }else{
        this.registerTitle="Update";
        this.providerService.getFileById(data.id).subscribe(res=>{
          console.log('res')
          console.log(res)
          this.fileId=res._id;
          this.fileType=res.type;
          this.fileStatus=res.status;
          this.fileName=res.fileName;
          this.reportFile=res.reportFile;
          this.formData=res;
        })
      }
    })
   }

  ngOnInit(): void {
       this.providerService.getFileType().subscribe(res => {
      console.log('type')
      console.log(res)
      this.typeData = res;
    });
  }


changeStatus(event){
if(event.target.value){
  this.providerService.changeStatus(this.fileId,event.target.value).subscribe(res=>{
    if(res){
      this.fileStatus=res;
      Swal.fire('Changed successfully!')
    }
  })
}
}
changeType(event){
  console.log('event')
  console.log(event.target.value)
  if(event.target.value){
    this.providerService.changeType(this.fileId,event.target.value).subscribe(res=>{
      if(res.status){
        this.fileType=res.fileType;
        Swal.fire('Changed successfully!')

      }
    })
  }
}
handleDownload(fileName){
  if(fileName){
    this.providerService.download('provider/download/'+fileName)
    .subscribe(blob =>{
      saveAs(blob, fileName)} )
  }   
}

uploadFile(file) {

  const formData = new FormData();
  formData.append('file', file.data);
  formData.append('fileId', this.fileId);
  file.inProgress = true;
  this.providerService.uploadReportFile(formData).pipe(
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
        this.reportFile=event.body.fileName;

        Swal.fire('Successfully uploaded!')
        setTimeout(() => {
          file.inProgress = false;
          file.progress = 0;
          this.files = [];
        }, 1000);
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

  if (this.fileStatus !== 'done') {
    Swal.fire('Change the file status!')
    return;
  }

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

}


