import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment as env } from "../../environments/environment";
import { catchError, map } from "rxjs/operators";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { EventSourcePolyfill } from 'ng-event-source';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  baseUrl = env.baseUrl + "patient/";
  eventSourceProviderState;

  constructor(
    private zone: NgZone, private http: HttpClient) {

  }

  close() {
    if (this.eventSourceProviderState) {
      console.log("PatientService close");
      this.eventSourceProviderState.close();
      this.eventSourceProviderState = null;
    }
  }


  getProviderState(room, reconnect) {
    const waitingPatientUrl = this.baseUrl + 'provider-state/' + room;
    let options = { headers: { headerName: 'HeaderValue', header2: 'HeaderValue2' } };
    this.eventSourceProviderState = new EventSourcePolyfill(waitingPatientUrl, options);
    return Observable.create(observer => {
      this.eventSourceProviderState .onmessage = (event) => {
        this.zone.run(() => {
          observer.next(event.data);
        });
      };
      this.eventSourceProviderState .onerror = (event) => {
        console.log("onerror ", event.target["readyState"], event);
        switch (event.target["readyState"]) {
          case EventSource.CLOSED:
            this.zone.run(() => {
              this.eventSourceProviderState.close();
              reconnect();
            });
            break;
          case 0:
            this.close();
            break;
        }
      };

    });

    /*this.eventSourceProviderState = new EventSource(waitingPatientUrl);
    return Observable.create(observer => {
      this.observableEventSoruce = observer;
      this.eventSourceProviderState.onopen = (event) => {
        console.log('getWaitingPatientsData2 connected');
      };
      this.eventSourceProviderState.onmessage = (event) => {
        //console.log("getWaitingPatientsData2 data onmessage",event.data);
        observer.next(event.data);
      };
      this.eventSourceProviderState.onerror = (event) => {
        console.log("onerror " , event.target["readyState"], event);
        this.eventSourceProviderState.close();
        if(event.target["readyState"] === 0) {
          console.log('The stream has been closed by the server.');
          this.eventSourceProviderState.close();
          observer.complete();
        } else {
          observer.error('EventSource error: ' + event);
        }
        switch (event.target["readyState"]) {
          case EventSource.CLOSED:
            setTimeout(function () {
              reconnect();
            }, 5000);
            break;
        }
      };
    });*/
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
    let getBlogUrl = this.baseUrl + "getBlog/" + id;
    return this.http.get<any>(getBlogUrl);
  }

  disconnectPatient(patientId) {
    const patientUrl = this.baseUrl + 'disconnect/' + patientId;
    return this.http.put(patientUrl, null)
  }
}


