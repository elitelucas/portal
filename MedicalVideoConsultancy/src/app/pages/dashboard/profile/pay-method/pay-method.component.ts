import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FileUploadService} from "../../../../_services/file-upload.service";
import {catchError, map} from "rxjs/operators";
import {HttpErrorResponse, HttpEventType} from "@angular/common/http";
import {of} from "rxjs";
import {environment} from "../../../../../environments/environment";
import { DataService } from "../../../../_services/data.service";
import {UserService} from "../../../../_services/user.service";
import {AuthService} from "../../../../_services/auth.service";

export interface PayData {
  QRimg:object[];
  account: string[];
  url: string[];
}

@Component({
  selector: 'app-pay-method',
  templateUrl: './pay-method.component.html',
  styleUrls: ['./pay-method.component.css']
})
export class PayMethodComponent implements OnInit {
  publicUrl = environment.baseUrl + "public/image/";
  currentUser: any;
  payData:PayData;
  qrDesc='';
  changeKey=true;
  displayKey:boolean=false;
  uploadImageName=[];
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; files = [] ;

  constructor(
    private fileUploadService: FileUploadService,
    private data: DataService,
    private userService:UserService,
    private authService:AuthService
    ) {
    this.currentUser = this.authService.getCurrentUser;
   }

  ngOnInit(): void {
    this.userService.getPayData(this.currentUser.id).subscribe(res=>{
      this.payData=res;
      console.log('res')
      console.log(res)
      console.log(typeof(res))
      console.log(res.length)
      if(this.payData && res.length){
        console.log('lll')
        this.displayKey=true;
      }
      else{
        this.payData={
          QRimg:[],
          account:[],
          url:[]
        }
        this.displayKey=false;
      }
    })
  }
  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('key', 'qrImage');
    file.inProgress = true;
    this.fileUploadService.upload(formData).pipe(
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

        if(this.payData.QRimg && this.payData.QRimg.length>=2){
          return
        }else{
          this.payData.QRimg.push({name:event.body.fileName, description:this.qrDesc});
          this.displayKey=true;
        }
      }
    });
  }

  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach(file => {
      this.uploadFile(file);
    });
  }

  handleUpload(qrDesc) {
    if(this.payData.QRimg && this.payData.QRimg.length>=2)
    return;
    this.qrDesc=qrDesc;
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
  AddAcount(back, account){
    if(back!=='' && account!=='')
    this.payData.account.push(back+'-'+account);
  }
  AddUrl(url){
    if(url!=='')
    this.payData.url.push(url);
  }
  RemoveItem(idx,key){
    if (key==='accountKey')
    this.payData.account.splice(idx,1);
    else if(key==='urlKey'){
      this.payData.url.splice(idx,1);
    }
   
    else if(key==='qr')
    this.payData.QRimg.splice(idx,1);
  }
  Update(){
    console.log('this.payData')
    console.log(this.payData)
    this.data.changeMessage(this.payData);
  }

}
