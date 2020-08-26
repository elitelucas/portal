import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../../../_services/auth.service";
import {catchError, map} from "rxjs/operators";
import {HttpErrorResponse, HttpEventType} from "@angular/common/http";
import {of} from "rxjs";
import {FileUploadService} from "../../../_services/file-upload.service";
import {ProviderService} from "../../../_services/provider.service";
import {environment} from "../../../../environments/environment";
import {constant} from "../../../_config/constant";

@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.component.html',
  styleUrls: ['./edit-room.component.css']
})
export class EditRoomComponent implements OnInit {
  @ViewChild("imageUpload", {static: false}) imageUpload: ElementRef;
  @ViewChild("videoUpload", {static: false}) videoUpload: ElementRef;
  currentUser: any;
  publicUrl = environment.baseUrl + 'public/';
  defaultText:string = constant.defaultText;
  defaultResetText: any;
  defaultImage = constant.defaultImage;
  tipsImage = constant.tipsImage;
  defaultVideo = constant.defaultVideo;
  file = [];
  constructor(private authService: AuthService, private providerService: ProviderService, private fileUploadService: FileUploadService) {
    this.defaultResetText = this.defaultText;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser;
    this.initRoomData();
  }

  initRoomData() {
    this.providerService.getRoomData(this.currentUser.id)
      .subscribe(result => {
        if(result) {
          this.defaultImage =  result.image !== '' ? this.publicUrl + "image/" + result.image : this.defaultImage;
          this.defaultVideo = result.video !== '' ? this.publicUrl + "video/" + result.video : this.defaultVideo;
          this.defaultText = result.text !== '' ? result.text : this.defaultText;
        }
      })
  }

    uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('media', file.media);
    formData.append('_id', this.currentUser.id);
    formData.append('room', this.currentUser.room);
    file.inProgress = true;
    this.fileUploadService.uploadEditRoomMedia(formData).pipe(
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
        if(file.media === 'image')  this.defaultImage =this.publicUrl + "image/" + event.body.image;
        else  {
          this.defaultVideo = "";
          let me = this;
          setTimeout(function () {
            me.defaultVideo = me.publicUrl + "video/" + event.body.video
          })
        }
        setTimeout(()=> {
          file.inProgress = false;
          file.progress = 0;
          this.file = [];
        }, 1000)

      }
    });
  }


  handleUpload(media) {
    const fileUpload = media === 'image'? this.imageUpload.nativeElement: this.videoUpload.nativeElement;
    fileUpload.onchange = () => {
      for (const f of fileUpload.files) {
        const file = f;
        this.file.push({ data: file, media: media, inProgress: false, progress: 0});
      }
      this.uploadFile(this.file[0]);
    };
    fileUpload.click();
  }

  resetText() {
    this.defaultText = this.defaultResetText;
    this.changeText(this.defaultText);
  }

  changeText(text) {
    this.providerService.changeText(this.currentUser.id, text)
      .subscribe(result => {
        console.log("bbbbbbbbbbbbbbb", result)
      })
  }

}
