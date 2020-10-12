import { baseUrl } from './patient.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
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
    /*console.log('checkRoomUrl')
    console.log(checkRoomUrl)*/
    return this.http.get<any>(checkRoomUrl)
  }

  checkPatient(dni) {
    const checkPatientUrl = baseUrl + 'provider/checkPatient/' + dni;
    this.trace("checkPatientUrl:", dni);

    return this.http.get<any>(checkPatientUrl)
  }
  postPatient(data) {
    const postPatientUrl = baseUrl + 'provider/postPatient';
    this.trace("postPatientUrl:", postPatientUrl);
    return this.http.put(postPatientUrl, { data });
  }

  //I added new func to get all patients data.

  getAllPatientsData(value, field) {
    const patientUrl = baseUrl + 'provider/allPatients';
    let params = new HttpParams().set("key", field).set("value", value);
    this.trace("getAllPatientsData:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });
  }

  getInitPatientsData(value, field) {
    const patientUrl = baseUrl + 'provider/initPatients';
    let params = new HttpParams().set("key", field).set("value", value);
    this.trace("getAllPatientsData:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });
  }

  getConsult(id, startDate, endDate) {
    const patientUrl = baseUrl + 'provider/consult/patient/' + id;
    let params = new HttpParams();
    if (undefined != startDate && endDate != undefined) {
      params = params.set("startDate", startDate).set("endDate", endDate);
    }
    this.trace("getConsult:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });

  }
  getFilterPatientsData(providerId,filterValue,key){

    const patientUrl = baseUrl + 'provider/filterPatients/'+providerId+'/'+filterValue+'/'+key;
    this.trace("getFilterPatientsData:", patientUrl);
    return this.http.get<any>(patientUrl);
  }

  getInitConsult(id){
    const patientUrl = baseUrl + 'provider/consult/'+id;
    this.trace("getConsult:", patientUrl);
    return this.http.get<any>(patientUrl);
  }

  getConsultInChat(patientId, providerId) {
    const patientUrl = baseUrl + 'provider/consultInChat';
    let params = new HttpParams().set("patientId", patientId).set("providerId", providerId);
    this.trace("getConsultInChat:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });
  }

  sendMail(from, email, subject, html) {
    //console.log('sdfsdfsdf')
    const mailUrl = baseUrl + 'provider/mail';
    this.trace("getConsultInChat:", mailUrl);
    return this.http.post(mailUrl, {
      from: from,
      email: email,
      subject: subject,
      html: html
    });
  }

  getOneConsult(patientId, consultId) {
    const patientUrl = baseUrl + 'provider/oneConsult';
    let params = new HttpParams().set("patientId", patientId).set("consultId", consultId);
    this.trace("getOneConsult:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });
  }

  updateConsult(updateData) {
    const updateUrl = baseUrl + 'provider/updateConsult';
    this.trace("updateUrl:", updateUrl);
    return this.http.put(updateUrl, updateData)
  }

  getChart(patientDni) {
    const chartUrl = baseUrl + 'provider/getChart/' + patientDni;
    this.trace("getChart:", chartUrl, patientDni);
    return this.http.get<any>(chartUrl);
  }

  editChart(updateData) {
    const updateUrl = baseUrl + 'provider/chart';
    this.trace("updateUrl:", updateUrl);
    return this.http.put(updateUrl, updateData)
  }

  getSignature(providerId: string): Observable<Blob> {
    /*console.log('providerId')
    console.log(providerId)*/
    const sigUrl = baseUrl + 'provider/getSignature/' + providerId;
    return this.http.get<any>(sigUrl)
  }


  //I added end

  getPatient(value, field) {
    const patientUrl = baseUrl + 'provider/patientByField';
    let params = new HttpParams().set("key", field).set("value", value);
    /*console.log(patientUrl);
    console.log(params);*/
    //this.trace("getPatient:", patientUrl, params);
    return this.http.get(patientUrl, { params });
  }

  updatePatient(patientData) {
    const patientUrl = baseUrl + 'provider/patient';
    this.trace("patientUrl:", patientUrl, patientData);
    return this.http.put(patientUrl, patientData)
  }

  updatePatientOnChart(patientData) {
    const patientUrl = baseUrl + 'provider/patient/chart';
    this.trace("patientUrl:", patientUrl, patientData);
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

  closeConsult(consultId) {
    let createConsultUrl = baseUrl + "provider/consult/" + consultId + "/close";
    this.trace("createConsultUrl:", createConsultUrl);
    return this.http.patch(createConsultUrl, null);
  }

  getLastAttetionsPatientsDataProvider(userId) {
    const lastAttetionsPatientsUrl = baseUrl + 'provider/consult/provider/' + userId;
    this.trace("getLastAttetionsPatientsDataProvider:", lastAttetionsPatientsUrl);
    return this.http.get<any>(lastAttetionsPatientsUrl).pipe(map((result: Consult[]) => {
      if (result) {
        return result;
      }
    }));
  }

  getLastAttetionsPatientsDataPatient(patientId) {
    const lastAttetionsPatientsUrl = baseUrl + 'provider/consult/patient/' + patientId;
    this.trace("getLastAttetionsPatientsDataPatient:", lastAttetionsPatientsUrl);
    return this.http.get<any>(lastAttetionsPatientsUrl).pipe(map((result: Consult[]) => {
      if (result) {
        console.log(result);
        return result;
      }
    }));
  }

  getPlans() {
    const getPlansUrl = baseUrl + 'plans';
    return this.http.get<any>(getPlansUrl);
  }
  sendSubcriptionData(data) {
    const subcriptionUrl = baseUrl + 'provider/subcription';
    return this.http.post(subcriptionUrl, data);

  }
  getPlansById(planId) {
    const getPlansUrl = baseUrl + 'plans/' + planId;
    return this.http.get<any>(getPlansUrl);
  }
  getCard(providerId) {
    const getCardUrl = baseUrl + 'provider/card/' + providerId;
    return this.http.get<any>(getCardUrl);
  }

  updateCard(data) {
    const updateCardUrl = baseUrl + 'provider/card';
    this.trace("updateCardUrl:", updateCardUrl);
    return this.http.put(updateCardUrl, data);
  }

  removeCard(cardId) {
    const deleteCardUrl = baseUrl + 'provider/card/' + cardId;
    this.trace("deletePlansUrl:", deleteCardUrl);
    return this.http.delete(deleteCardUrl);
  }
  createPlan(data) {

    const createPlanUrl = baseUrl + 'plans';
    return this.http.post(createPlanUrl, data);

  }
  updatePlans(data) {
    const updatePlansUrl = baseUrl + 'plans/update';
    this.trace("updatePlansUrl:", updatePlansUrl);
    return this.http.put(updatePlansUrl, data);
  }
  deletePlans(planId) {
    const deletePlansUrl = baseUrl + 'plans/' + planId;
    this.trace("deletePlansUrl:", deletePlansUrl);
    return this.http.delete(deletePlansUrl);
  }


  trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    //console.log(now + ': ', arg);
  }

}

