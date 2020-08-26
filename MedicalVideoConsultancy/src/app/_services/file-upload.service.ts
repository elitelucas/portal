import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  public  baseUrl = environment.baseUrl;
  constructor(private  http: HttpClient) { }

  public upload(formData) {
    const imageUrl = this.baseUrl + "users/images";
    return this.http.post<any>(imageUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  public uploadEditRoomMedia(formData) {
    const imageUrl = this.baseUrl + "provider/mediaUpload";
    return this.http.post<any>(imageUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}


