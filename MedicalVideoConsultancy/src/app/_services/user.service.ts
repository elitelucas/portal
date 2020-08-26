import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
const baseUrl = environment.baseUrl + "users";
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get<any>(baseUrl);
  }

  updateUserData(userData) {
    let updateUrl = baseUrl+ "/"+userData.userId;
    return this.http.patch<any>(updateUrl, userData)
  }

  deleteUserData(userData) {
    let deleteUrl = baseUrl + "/" + userData.userId;
    return this.http.delete(deleteUrl)
  }

  sendEmail(userData) {
    let emailUrl = baseUrl + "/email-verification/";
    return this.http.post(emailUrl, userData)
  }

  sendSMS(userData) {
    let smsUrl = baseUrl + "/sms-verification";
    return this.http.post(smsUrl, userData)
  }

  updateProfile(profile, id) {
    let profileUrl = baseUrl + "/update-profile/" + id;
    return this.http.put<any>(profileUrl, {profile})
  }
}
