import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment as env} from "../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {BehaviorSubject, Observable, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private  http: HttpClient) { 
}
  public chartList() {
    const chartListUrl = baseUrl + 'chart/list';
    return this.http.get<any>(chartListUrl).pipe(map(res=> {
      console.log('res')
      console.log(res)
      return res;
    }));
  }
  public download(fileName: string): Observable<Blob> {
    return this.http.get(baseUrl+fileName, {
      responseType: 'blob'
    })
  }
}

export const baseUrl = env.baseUrl;

