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
  updateSigPay(sig, pay, id) {
    let updateSigPayUrl = baseUrl + "/update-sigPay/" + id;
    return this.http.put<any>(updateSigPayUrl, {sigImgSrc:sig,payMethod:pay})
  }
  updatePayment(payment, id) {
    let updatePaymentUrl = baseUrl + "/updatePayment/" + id;
    return this.http.put<any>(updatePaymentUrl, {payment})
  }
  updateSignature(signature, id) {
    let updateSignatureUrl = baseUrl + "/updateSignature/" + id;
    return this.http.put<any>(updateSignatureUrl, {signature})
  }


  getPayData(id) {
    let paymentUrl=baseUrl+"/payment/"+id;
    return this.http.get<any>(paymentUrl);
  }


  getSignature(id) {
    let sigUrl=baseUrl+"/signature/"+id;
    return this.http.get<any>(sigUrl);
  }
  
  //Get blog data from user collection of current provider
  getBlog(id) {
    let getBlogUrl=baseUrl+"/getBlog/"+id;
    return this.http.get<any>(getBlogUrl);
  }

  //Post blog data to user collection of current provider
  postBlog(data) {
    let postBlogUrl=baseUrl+"/postBlog/";
    return this.http.post<any>(postBlogUrl,data);
  }

   //Updated blog data send to user collection of current provider
   updateBlog(data) {
    let updateBlog=baseUrl+"/updateBlog/";
    return this.http.put<any>(updateBlog,data);
  }

   //Delete blog data of user collection of current provider
   deleteBlog(postId) {
    let deleteBlog=baseUrl+"/deleteBlog/"+postId;
    return this.http.delete<any>(deleteBlog);
  }
}
