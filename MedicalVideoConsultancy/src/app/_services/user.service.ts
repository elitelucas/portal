import { filter } from 'rxjs/operators';
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

  getUserById(userId) {
    return this.http.get<any>(baseUrl+'/getUserById/'+userId);
  }
  createUser(data){
    let userUrl= baseUrl+"/super-providers";
    return this.http.post<any>(userUrl,data);
  }


  getProviders() {
    let providersUrl= baseUrl+"/super-providers";
    return this.http.get<any>(providersUrl);
  }

  
  getFilterData(filterValue) {
    let filterUrl=baseUrl+"/filterProvider/"+filterValue;
    return this.http.get<any>(filterUrl);
  }

   //Delete provider in users collection
   deleteProvider(providerId) {
    let deleteProvider=baseUrl+"/deleteProvider/"+providerId;
    return this.http.delete<any>(deleteProvider);
  }

  getAdmins() {
    let adminsUrl= baseUrl+"/super-admins";
    return this.http.get<any>(adminsUrl);
  }
  getAdminById(adminId) {
    let adminsUrl= baseUrl+"/super-admins/"+adminId;
    return this.http.get<any>(adminsUrl);
  }

  createAdmin(data){
    let adminsUrl= baseUrl+"/super-admins";
    return this.http.post<any>(adminsUrl,data);
  }
  updateAdmin(data,adminId){
    let adminsUrl= baseUrl+"/super-admins/"+adminId;
    return this.http.put<any>(adminsUrl,data);
  }

  
  getAdminFilterData(filterValue) {
    let filterUrl=baseUrl+"/filterAdmin/"+filterValue;
    return this.http.get<any>(filterUrl);
  }

   //Delete administrator in admins collection
   deleteAdmin(providerId) {
    let deleteAdmin=baseUrl+"/deleteAdmin/"+providerId;
    return this.http.delete<any>(deleteAdmin);
  }


  updateUserData(userData) {
    let updateUrl = baseUrl+ "/"+userData.userId;
    return this.http.patch<any>(updateUrl, userData)
  }
  updatePermission(userId,permission) {

    let updateUrl = baseUrl+ "/updatePermission/"+userId;
    return this.http.put<any>(updateUrl, {role:permission})
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

  updateUserPlanId(data){
    let updatePlanId=baseUrl+"/updatePlanId";
    return this.http.put<any>(updatePlanId,data);
  }

  changeUserSubscriptionStatus(providerId){
    const changeUserSubscriptionStatus = baseUrl + '/changeSubscriptionStatus/';
    return this.http.put(changeUserSubscriptionStatus,{providerId});
  }

 
}
