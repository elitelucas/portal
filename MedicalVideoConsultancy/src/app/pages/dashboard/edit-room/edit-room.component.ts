import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../../../_services/auth.service";
import {catchError, map} from "rxjs/operators";
import {HttpErrorResponse, HttpEventType} from "@angular/common/http";
import {of} from "rxjs";
import {FileUploadService} from "../../../_services/file-upload.service";
import {ProviderService} from "../../../_services/provider.service";
import {environment} from "../../../../environments/environment";
import {constant} from "../../../_config/constant";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.component.html',
  styleUrls: ['./edit-room.component.css']
})
export class EditRoomComponent implements OnInit {
  public Editor = ClassicEditor;

  postTitleArr=[];
  postBodyArr=[];
  literalArr=[];
  kk=[];
  tmpTitle='';
  tmpBody='';
  clickKey:boolean;
  @ViewChild("imageUpload", {static: false}) imageUpload: ElementRef;
  @ViewChild("videoUpload", {static: false}) videoUpload: ElementRef;
  currentUser: any;
  publicUrl = environment.baseUrl + 'public/';

  file = [];
  constructor(private authService: AuthService, private providerService: ProviderService, private fileUploadService: FileUploadService) {
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser;
  }

  publishPost(title, body){ 

    this.clickKey=true;
    if(title===''|| body==='')
    return
    this.kk.push(true);
    this.literalArr.push({postTitle:title, postBody:body})
  }
  edit(idx){
    this.kk[idx]=false;
    this.tmpTitle=this.literalArr[idx].postTitle;
    this.tmpBody=this.literalArr[idx].postBody;
  }
  editOk(title, body, idx){
    this.literalArr.splice(idx,1,{postTitle:title, postBody:body});
    this.kk[idx]=true;
  }
  editCancel(idx){
    this.kk[idx]=true;
  }
  delete(idx){
    this.literalArr.splice(idx,1);
  }
}
