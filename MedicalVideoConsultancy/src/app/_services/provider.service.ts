import { Injectable } from '@angular/core';
import{Observable} from 'rxjs'
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { baseUrl } from "./auth.service";
import { map } from "rxjs/operators";
import { Patient, Consult } from '../_model/user';
import { ArrayType } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {
  }


  sendSMS(smsData) {
    const smsUrl = baseUrl + 'provider/invite-by-sms';
    this.trace("smsUrl:", smsUrl);
    return this.http.post<any>(smsUrl, smsData);
  }

  getRoomData(userId) {
    const roomUrl = baseUrl + 'provider/room/' + userId;
    this.trace("roomUrl:", roomUrl);
    return this.http.get<any>(roomUrl)
  }

  changeText(userId, text) {
    const textUrl = baseUrl + 'provider/text/' + userId;
    this.trace("changeText:", textUrl);
    return this.http.patch(textUrl, { text: text })
  }

  checkRoomExist(room) {
    const checkRoomUrl = baseUrl + 'provider/roomName/' + room;
    this.trace("checkRoomExist:", checkRoomUrl);
    console.log('checkRoomUrl')
    console.log(checkRoomUrl)
    return this.http.get<any>(checkRoomUrl)
  }

  //I added new func to get all patients data.

  getAllPatientsData(value, field){
    console.log('value')
    console.log(value)
    const patientUrl = baseUrl + 'provider/allPatients';
    let params = new HttpParams().set("key", field).set("value", value);
    this.trace("getAllPatientsData:", patientUrl,params);
    return this.http.get<any>(patientUrl,{params});
  }

  getConsult(id,startDate,endDate){
    const patientUrl = baseUrl + 'provider/consult/'+id+'/'+startDate+'/'+endDate;
    this.trace("getConsult:", patientUrl);
    return this.http.get<any>(patientUrl);
  }

  getConsultInChat(patientId, providerId){
    const patientUrl = baseUrl + 'provider/consultInChat';
    let params = new HttpParams().set("patientId", patientId).set("providerId", providerId);
    this.trace("getConsultInChat:", patientUrl,params);
    return this.http.get<any>(patientUrl,{params});
  }
  sendMail(html,email){
    console.log('sdfsdfsdf')
    const mailUrl = baseUrl + 'provider/mail';
    this.trace("getConsultInChat:", mailUrl);
    return this.http.post(mailUrl,{email:email,html:html});
  }

  getOneConsult(patientId, consultId){
    const patientUrl = baseUrl + 'provider/oneConsult';
    let params = new HttpParams().set("patientId", patientId).set("consultId", consultId);
    this.trace("getOneConsult:", patientUrl,params);
    return this.http.get<any>(patientUrl,{params});
  }

  updateConsult(updateData) {
    const updateUrl = baseUrl + 'provider/updateConsult';
    this.trace("updateUrl:", updateUrl);
    return this.http.put(updateUrl, updateData)
  }

  getChart(patientDni){
    const chartUrl = baseUrl + 'provider/getChart/'+patientDni;
    this.trace("getChart:", chartUrl,patientDni);
    return this.http.get<any>(chartUrl);
  }

  editChart(updateData) {
    const updateUrl = baseUrl + 'provider/chart';
    this.trace("updateUrl:", updateUrl);
    return this.http.put(updateUrl, updateData)
  }

  getSignature(providerId: string): Observable<Blob> {
    console.log('providerId')
    console.log(providerId)
    const sigUrl = baseUrl + 'provider/getSignature/'+providerId;
    return this.http.get<any>(sigUrl)
  }


  //I added end

  getPatient(value, field) {
    const patientUrl = baseUrl + 'provider/patientByField';
    let params = new HttpParams().set("key", field).set("value", value);
    this.trace("getPatient:", patientUrl, params);
    return this.http.get(patientUrl, { params });
  }

  updatePatient(patientData) {
    const patientUrl = baseUrl + 'provider/patient';
    this.trace("patientUrl:", patientUrl);
    return this.http.put(patientUrl, patientData)
  }

  getWaitingPatientsData(room) {
    const waitingPatientUrl = baseUrl + 'provider/patients-waiting/' + room;
    this.trace("getWaitingPatientsData:", waitingPatientUrl);
    return this.http.get<Patient[]>(waitingPatientUrl);
  }

  createConsult(consult) {
    let createConsultUrl = baseUrl + "provider/consult";
    this.trace("createConsultUrl:", createConsultUrl);
    return this.http.post(createConsultUrl, consult);
  }

  getLastAttetionsPatientsData(userId) {
    const lastAttetionsPatientsUrl = baseUrl + 'provider/consult/' + userId;
    this.trace("getLastAttetionsPatientsData:", lastAttetionsPatientsUrl);
    return this.http.get<any>(lastAttetionsPatientsUrl).pipe(map((result: Consult[]) => {
      if (result) {
        return result;
      }
    }));
  }

  trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', arg);
  }

}

