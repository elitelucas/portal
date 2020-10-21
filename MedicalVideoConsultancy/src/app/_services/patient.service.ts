import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment as env } from "../../environments/environment";
import { catchError, map } from "rxjs/operators";
import { BehaviorSubject, Observable, throwError } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class PatientService {

  baseUrl = env.baseUrl + "patient/";

  constructor(private http: HttpClient) {

  }

  updatePatient(patientData) {
    const patientUrl = this.baseUrl;
    return this.http.put(patientUrl, patientData)
  }

  public chartList() {
    const chartListUrl = this.baseUrl + 'chart/list';
    return this.http.get<any>(chartListUrl).pipe(map(res => {
      return res;
    }));
  }

  public download(fileName: string): Observable<Blob> {
    return this.http.get(this.baseUrl + fileName, {
      responseType: 'blob'
    })
  }

  checkRoomExist(room) {
    const checkRoomUrl = this.baseUrl + 'roomName/' + room;
    return this.http.get<any>(checkRoomUrl)
  }

  getPayData(id) {
    let paymentUrl = this.baseUrl + "payment/" + id;
    return this.http.get<any>(paymentUrl);
  }

  public uploadFile(formData) {
    const fileUrl = this.baseUrl + "uploadFile";
    return this.http.post<any>(fileUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  save(providerId, patientId, feeback): Observable<any> {
    const saveFeedbackUrl = this.baseUrl + 'feedback';
    return this.http.post(saveFeedbackUrl, {
      providerId: providerId,
      patientId: patientId,
      feeback: feeback
    });
  }

  getBlog(id) {
    let getBlogUrl=this.baseUrl+"getBlog/"+id;
    return this.http.get<any>(getBlogUrl);
  }

  getProviderState(room, reconnect) {
    const waitingPatientUrl = this.baseUrl + 'provider-state/' + room;
    return Observable.create(observer => {
      const eventSource = new EventSource(waitingPatientUrl);
      eventSource.onopen = (event) => {
        console.log('getWaitingPatientsData2 connected');
      };
      eventSource.onmessage = (event) => {
        //console.log("getWaitingPatientsData2 data onmessage",event.data);
        observer.next(event.data);
      };
      eventSource.onerror = (event) => {
        console.log("onerror ", event);
        eventSource.close();
        switch (event.target["readyState"]) {
          case EventSource.CLOSED:
            setInterval(function () {
              reconnect();
            }, 1000);
            break;
        }
      };
    });
  }

  disconnectPatient(patientId) {
    const patientUrl = this.baseUrl + 'disconnect/' + patientId;
    return this.http.put(patientUrl, null)
  }
}


