import { baseUrl } from './../../../_services/auth.service';
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
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import { UserService } from './../../../_services/user.service';
import { HttpParams, HttpClient } from "@angular/common/http";
import { DataService } from "../../../_services/data.service";



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
  tmpKk=[];
  firstVal='';

  clickKey:boolean;
  @ViewChild("imageUpload", {static: false}) imageUpload: ElementRef;
  @ViewChild("videoUpload", {static: false}) videoUpload: ElementRef;
  currentUser: any;
  publicUrl = environment.baseUrl + 'public/';

  file = [];
  constructor(
    private authService: AuthService,
    private providerService: ProviderService, 
    private fileUploadService: FileUploadService,
    private userService:UserService,
    private http:HttpClient,
    private data:DataService
    ) {
  }

  ngOnInit(): void {
    this.data.currentMessage.subscribe(message=>{
      console.log('message')
      console.log(message)
      // this.firstVal='<img src="'+this.publicUrl+'image/first.png">';
    })
    
    this.currentUser = this.authService.getCurrentUser;
    this.userService.getBlog(this.currentUser.id)
    .subscribe(res=>{
      console.log('res')
      console.log(res)
      this.literalArr=res;
      this.tmpKk=[];
      this.literalArr.forEach(item=>{
        this.tmpKk.push(true)
      })
      this.kk=this.tmpKk;
    })
  }


  publishPost(title, body){ 
  

    this.clickKey=true;
    if(title===''|| body==='')
    return
    console.log('title')
    console.log(title)
    console.log('body')
    console.log(body)
    this.userService.postBlog({postTitle:title, postBody:body,userId:this.currentUser.id})
    .subscribe(res=>{
      this.receiveData(res)
    })
  }
  edit(idx){
    this.kk[idx]=false;
  }
  editOk(title, body, idx){
    this.userService.updateBlog({idx:idx,postTitle:title, postBody:body,userId:this.currentUser.id})
    .subscribe(res=>{
      this.receiveData(res)
    })
  }
  editCancel(idx){
    this.kk[idx]=true;
  }
  delete(idx){
    this.userService.deleteBlog({idx:idx,userId:this.currentUser.id})
    .subscribe(res=>{
      this.receiveData(res)

    })
  }
  receiveData(res){
    this.literalArr=res;
    this.tmpKk=[];
    this.literalArr.forEach(item=>{
      this.tmpKk.push(true)
    })
    this.kk=this.tmpKk;
  }
  onReady(eventData) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (loader) {
      console.log('btoa(loader.file)');
      console.log(btoa(loader.file));
      return new UploadAdapter(loader);
    };
  }
}
 
export class UploadAdapter {
  private loader;
  constructor(loader: any) {
    this.loader = loader;
    console.log(this.readThis(loader.file));
  }

  public upload(): Promise<any> {
    //"data:image/png;base64,"+ btoa(binaryString) 
    return this.readThis(this.loader.file);
  }

  readThis(file: File): Promise<any> {
    let imagePromise: Promise<any> = new Promise((resolve, reject) => {
      var myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        let image = myReader.result;
        resolve({ default: "data:image/png;base64," + image });
      }
      if(!file){
        myReader.readAsDataURL(file);
      }
    });
    return imagePromise;
  }

}