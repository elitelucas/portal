
import { environment as env } from "../../environments/environment";
import { Injectable, NgZone } from '@angular/core';
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

  baseUrl = env.baseUrl;
  eventSourceWaitingPatient : EventSource;

  //eventSource: any = window['EventSource'];

  constructor(private http: HttpClient, private _zone: NgZone) {
  }

  close(){
    if(this.eventSourceWaitingPatient){
      console.log("ProviderService close");
      this.eventSourceWaitingPatient.close();
      this.eventSourceWaitingPatient = null;
    }
  }

  getWaitingPatientsData(room, reconnect) {
    const waitingPatientUrl = this.baseUrl + 'provider/patients-waiting/' + room;
    this.eventSourceWaitingPatient = new EventSource(waitingPatientUrl);
    return Observable.create(observer => {
      this.eventSourceWaitingPatient.onopen = (event) => {
        console.log('getWaitingPatientsData2 connected');
      };
      this.eventSourceWaitingPatient.onmessage = (event) => {
        //console.log("getWaitingPatientsData2 data onmessage",event.data);
        observer.next(event.data);
      };
      this.eventSourceWaitingPatient.onerror = (event) => {
        console.log("onerror ", event.target["readyState"]);
        this.eventSourceWaitingPatient.close();
        switch (event.target["readyState"]) {
          case EventSource.CLOSED:
            setTimeout(function () {
              reconnect();
            }, 5000);
            break;
        }
      };
    });
  }

  sendSMS(smsData) {
    const smsUrl = this.baseUrl + 'provider/invite-by-sms';
    this.trace("smsUrl:", smsUrl);
    return this.http.post<any>(smsUrl, smsData);
  }

  /*getRoomData(userId) {
    const roomUrl = this.baseUrl + 'provider/room/' + userId;
    this.trace("roomUrl:", roomUrl);
    return this.http.get<any>(roomUrl)
  }*/

  changeText(userId, text) {
    const textUrl = this.baseUrl + 'provider/text/' + userId;
    this.trace("changeText:", textUrl);
    return this.http.patch(textUrl, { text: text })
  }

  /*checkRoomExist(room) {
    const checkRoomUrl = this.baseUrl + 'provider/roomName/' + room;
    this.trace("checkRoomExist:", checkRoomUrl);
    console.log('checkRoomUrl')
    console.log(checkRoomUrl)
    return this.http.get<any>(checkRoomUrl)
  }*/

  checkPatient(dni) {
    const checkPatientUrl = this.baseUrl + 'provider/checkPatient/' + dni;
    this.trace("checkPatientUrl:", dni);

    return this.http.get<any>(checkPatientUrl)
  }
  postPatient(data) {
    const postPatientUrl = this.baseUrl + 'provider/postPatient';
    this.trace("postPatientUrl:", postPatientUrl);
    return this.http.put(postPatientUrl, { data });
  }

  //I added new func to get all patients data.

  getAllPatientsData(providerId, validateDni, validateName , limit, page) {
    const patientUrl = this.baseUrl + 'provider/allPatients/'+providerId;
    let params = new HttpParams().set("dni", validateDni).set("fullName", validateName).set("limit", limit).set("page", page);
   // this.trace("getAllPatientsData:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });
  }

  /*getInitPatientsData2(value, field) {
    const patientUrl = this.baseUrl + 'provider/initPatients';
    let params = new HttpParams().set("key", field).set("value", value);
    this.trace("getAllPatientsData:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });
  }

  getFilterPatientsData2(providerId, validateDni, validateName) {
    const patientUrl = this.baseUrl + 'provider/filterPatients/' + providerId ;
    this.trace("getFilterPatientsData:", patientUrl);
    let params = new HttpParams().set("dni", validateDni).set("fullName", validateName);
    return this.http.get<any>(patientUrl, { params });
  }*/

  getConsult(id, startDate, endDate) {
    const patientUrl = this.baseUrl + 'provider/consult/patient/' + id;
    let params = new HttpParams();
    if (undefined != startDate && endDate != undefined) {
      params = params.set("startDate", startDate).set("endDate", endDate);
    }
    this.trace("getConsult:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });

  }


  getInitConsult(id) {
    const patientUrl = this.baseUrl + 'provider/consult/' + id;
    this.trace("getConsult:", patientUrl);
    return this.http.get<any>(patientUrl);
  }

  getConsultInChat(patientId, providerId) {
    const patientUrl = this.baseUrl + 'provider/consultInChat';
    let params = new HttpParams().set("patientId", patientId).set("providerId", providerId);
    this.trace("getConsultInChat:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });
  }

  sendMail(from, email, subject, html) {
    //console.log('sdfsdfsdf')
    const mailUrl = this.baseUrl + 'provider/mail';
    this.trace("getConsultInChat:", mailUrl);
    return this.http.post(mailUrl, {
      from: from,
      email: email,
      subject: subject,
      html: html
    });
  }

  getOneConsult(patientId, consultId) {
    const patientUrl = this.baseUrl + 'provider/oneConsult';
    let params = new HttpParams().set("patientId", patientId).set("consultId", consultId);
    this.trace("getOneConsult:", patientUrl, params);
    return this.http.get<any>(patientUrl, { params });
  }

  updateConsult(updateData) {
    const updateUrl = this.baseUrl + 'provider/updateConsult';
    this.trace("updateUrl:", updateUrl);
    return this.http.put(updateUrl, updateData)
  }

  getChart(patientDni) {
    const chartUrl = this.baseUrl + 'provider/getChart/' + patientDni;
    this.trace("getChart:", chartUrl, patientDni);
    return this.http.get<any>(chartUrl);
  }

  editChart(updateData) {
    const updateUrl = this.baseUrl + 'provider/chart';
    this.trace("updateUrl:", updateUrl);
    return this.http.put(updateUrl, updateData)
  }

  getSignature(providerId: string): Observable<Blob> {
    /*console.log('providerId')
    console.log(providerId)*/
    const sigUrl = this.baseUrl + 'provider/getSignature/' + providerId;
    return this.http.get<any>(sigUrl)
  }


  //I added end

  getPatient(value, field) {
    const patientUrl = this.baseUrl + 'provider/patientByField';
    let params = new HttpParams().set("key", field).set("value", value);
    /*console.log(patientUrl);
    console.log(params);*/
    //this.trace("getPatient:", patientUrl, params);
    return this.http.get(patientUrl, { params });
  }

  updatePatient(patientData) {
    const patientUrl = this.baseUrl + 'provider/patient';
    this.trace("patientUrl:", patientUrl, patientData);
    return this.http.put(patientUrl, patientData)
  }

  updatePatientOnChart(patientData) {
    const patientUrl = this.baseUrl + 'provider/patient/chart';
    this.trace("patientUrl:", patientUrl, patientData);
    return this.http.put(patientUrl, patientData)
  }


  disconnectPatient(patientId) {
    const patientUrl = this.baseUrl + 'provider/patient/disconnect/' + patientId;
    console.log("disconnectPatient:", patientUrl);
    return this.http.put(patientUrl, null)
  }

  createConsult(consult) {
    let createConsultUrl = this.baseUrl + "provider/consult";
    this.trace("createConsultUrl:", createConsultUrl);
    return this.http.post(createConsultUrl, consult);
  }

  closeConsult(consultId) {
    let createConsultUrl = this.baseUrl + "provider/consult/" + consultId + "/close";
    this.trace("createConsultUrl:", createConsultUrl);
    return this.http.patch(createConsultUrl, null);
  }

  updateRoom(providerId, room) {
    let createConsultUrl = this.baseUrl + "provider/room/" + providerId;
    return this.http.patch(createConsultUrl, {
      room: room
    });

  }

  getLastAttetionsPatientsDataProvider(userId) {
    const lastAttetionsPatientsUrl = this.baseUrl + 'provider/consult/provider/' + userId;
    this.trace("getLastAttetionsPatientsDataProvider:", lastAttetionsPatientsUrl);
    return this.http.get<any>(lastAttetionsPatientsUrl).pipe(map((result: Consult[]) => {
      if (result) {
        return result;
      }
    }));
  }

  getLastAttetionsPatientsDataPatient(patientId) {
    const lastAttetionsPatientsUrl = this.baseUrl + 'provider/consult/patient/' + patientId;
    this.trace("getLastAttetionsPatientsDataPatient:", lastAttetionsPatientsUrl);
    return this.http.get<any>(lastAttetionsPatientsUrl).pipe(map((result: Consult[]) => {
      if (result) {
        console.log(result);
        return result;
      }
    }));
  }

  getPlans() {
    const getPlansUrl = this.baseUrl + 'plans';
    return this.http.get<any>(getPlansUrl);
  }
  sendSubcriptionData(data) {
    const subcriptionUrl = this.baseUrl + 'provider/subcription';
    return this.http.post(subcriptionUrl, data);

  }
  sendMailForSubscription(data) {
    const sendMailForSubscription = this.baseUrl + 'provider/sendMail';
    return this.http.post(sendMailForSubscription, data);

  }
  getPlansById(planId) {
    const getPlansUrl = this.baseUrl + 'plans/' + planId;
    return this.http.get<any>(getPlansUrl);
  }
  getCard(providerId) {
    const getCardUrl = this.baseUrl + 'provider/card/' + providerId;
    return this.http.get<any>(getCardUrl);
  }

  updateCard(data) {
    const updateCardUrl = this.baseUrl + 'provider/card';
    this.trace("updateCardUrl:", updateCardUrl);
    return this.http.put(updateCardUrl, data);
  }

  removeCard(cardId) {
    const deleteCardUrl = this.baseUrl + 'provider/card/' + cardId;
    this.trace("deletePlansUrl:", deleteCardUrl);
    return this.http.delete(deleteCardUrl);
  }
  createPlan(data) {

    const createPlanUrl = this.baseUrl + 'plans';
    return this.http.post(createPlanUrl, data);

  }
  updatePlans(data) {
    const updatePlansUrl = this.baseUrl + 'plans/update';
    this.trace("updatePlansUrl:", updatePlansUrl);
    return this.http.put(updatePlansUrl, data);
  }
  deletePlans(planId) {
    const deletePlansUrl = this.baseUrl + 'plans/' + planId;
    this.trace("deletePlansUrl:", deletePlansUrl);
    return this.http.delete(deletePlansUrl);
  }

  getFeedbacks(providerId) {
    const feedbackUrl = this.baseUrl + 'provider/feedback/' + providerId;
    return this.http.get<any>(feedbackUrl);
  }

  trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    //console.log(now + ': ', arg);
  }

}

