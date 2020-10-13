import { baseUrl } from './../../../_services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from "../../../_services/auth.service";

import { FileUploadService } from "../../../_services/file-upload.service";
import { ProviderService } from "../../../_services/provider.service";
import { environment } from "../../../../environments/environment";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { UserService } from './../../../_services/user.service';
import { HttpParams, HttpClient } from "@angular/common/http";
import { DataService } from "../../../_services/data.service";
import Swal from 'sweetalert2';
import { ContentBlogService } from '../../../_services/content-blog.service';



@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.component.html',
  styleUrls: ['./edit-room.component.css']
})
export class EditRoomComponent implements OnInit {
  public Editor = ClassicEditor;

  postTitleArr = [];
  postBodyArr = [];
  literalArr = [];
  kk = [];
  tmpKk = [];
  firstVal = '';

  clickKey: boolean;
  @ViewChild("imageUpload", { static: false }) imageUpload: ElementRef;
  @ViewChild("videoUpload", { static: false }) videoUpload: ElementRef;
  @ViewChild('editBody') editBody;
  currentUser: any;
  publicUrl = environment.baseUrl + 'public/';

  file = [];
  constructor(
    private authService: AuthService,
    private providerService: ProviderService,
    private fileUploadService: FileUploadService,
    private userService: UserService,
    private http: HttpClient,
    private data: DataService,
    private contentBlogService: ContentBlogService
  ) {
  }

  ngOnInit(): void {
    this.data.currentMessage.subscribe(message => {
      // this.firstVal='<img src="'+this.publicUrl+'image/first.png">';
    })

    this.currentUser = this.authService.getCurrentUser;
    this.userService.getBlog(this.currentUser.id)
      .subscribe(res => {
        this.literalArr = res;
        this.tmpKk = [];
        this.literalArr.forEach(item => {
          this.contentBlogService.getByUrl(item.url).subscribe(html => {
            item.postBody = html;
          });
          this.tmpKk.push(true)
        })
        this.kk = this.tmpKk;
      })
  }


  publishPost(title, body) {
    if (body.length > 10000000) {
      Swal.fire('Blog size limit is 5Mbyte')
      return;
    }
    if (title === '' || body === ''){
      Swal.fire('Input correctly!')
      return
    }
    this.userService.postBlog({ postTitle: title, postBody: body, userId: this.currentUser.id })
      .subscribe(res => {
        this.receiveData(res)
      })
  }

  edit(idx) {
    this.kk[idx] = false;

  }

  editOk(title, body, postId, idx) {
    if (body.length > 10000000) {
      Swal.fire('Blog size limit is 5Mbyte')
      return;
    }
    this.userService.updateBlog({ postId, postTitle: title, postBody: body })
      .subscribe(res => {
        this.contentBlogService.getByUrl(res.url).subscribe(html => {
          res.postBody = html;
        });
        this.literalArr.splice(idx, 1, res);
        this.tmpKk = [];
        this.literalArr.forEach(item => {
          this.tmpKk.push(true)
        })
        this.kk = this.tmpKk;
      })
  }

  editCancel(idx) {
    this.kk[idx] = true;
  }

  delete(postId, idx) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteBlog(postId)
          .subscribe(res => {
            this.literalArr.splice(idx, 1);
            Swal.fire(
              'Deleted!',
              'Your file has been deleted.',
              'success'
            )
          })
      }
    })

  }

  receiveData(res) {
    this.contentBlogService.getByUrl(res.url).subscribe(html => {
      res.postBody = html;
    });
    this.literalArr.push(res);
    this.tmpKk = [];
    this.literalArr.forEach(item => {
      this.tmpKk.push(true)
    })
    this.kk = this.tmpKk;
  }

  onReady(eventData) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (loader) {
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
      if (!file) {
        myReader.readAsDataURL(file);
      }
    });
    return imagePromise;
  }
  ngAfterViewInit() {
  }
}