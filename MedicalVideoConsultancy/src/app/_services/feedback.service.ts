import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  save(providerId, patientId, feeback): Observable<any> {
    const saveFeedbackUrl = this.baseUrl + 'provider/feedback';    
    console.log("saveFeedbackUrl:"+saveFeedbackUrl);
    return this.http.post(saveFeedbackUrl,{
      providerId:providerId,
      patientId:patientId,
      feeback:feeback
    });
  }

  getFeedbacks(providerId){
    const feedbackUrl= this.baseUrl + 'provider/feedback/'+providerId;
    return this.http.get<any>(feedbackUrl);
  }

}
