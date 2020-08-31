import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { baseUrl } from "./auth.service";
import { map } from "rxjs/operators";
import { Patient, Consult } from '../_model/user';

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

  createConsult(consult: Consult) {
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
