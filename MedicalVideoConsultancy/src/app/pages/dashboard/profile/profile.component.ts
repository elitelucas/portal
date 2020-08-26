import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../../../_services/auth.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FileUploadService} from "../../../_services/file-upload.service";
import {catchError, map} from "rxjs/operators";
import {HttpErrorResponse, HttpEventType} from "@angular/common/http";
import {of} from "rxjs";
import {UserService} from "../../../_services/user.service";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  profileForm: FormGroup;
  userData: any;
  publicUrl = environment.baseUrl + "public/image/";
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef; files = [] ;
  private isEmailDuplicated: boolean = false;
  private isRoomDuplicated: boolean= false;
  constructor(private authService: AuthService, private formBuilder: FormBuilder, private fileUploadService: FileUploadService, private userService: UserService)
  {this.currentUser = this.authService.getCurrentUser;}

  ngOnInit(): void {
    this.initProfile()
  }

  initProfile() {
    this.profileForm = this.formBuilder.group({
      firstName: [this.currentUser.firstName],
      lastName: [this.currentUser.lastName],
      email: [this.currentUser.email],
      phoneNumber: [this.currentUser.phoneNumber],
      password: [''],
      room: [this.currentUser.room]
    })
  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('_id', this.currentUser.id);
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
        this.userData = event.body;
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

  updateProfile() {
    this.userService.updateProfile(this.profileForm.value, this.currentUser.id).subscribe(res=> {
      // this.currentUser = result;
      if(res && res.keyValue) {
        if(res.keyValue.room) {this.isRoomDuplicated = true;}
        else if(res.keyValue.email) {this.isEmailDuplicated = true;}
      }
    })
  }

}
