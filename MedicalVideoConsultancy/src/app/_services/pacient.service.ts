import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment as env} from "../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {constant} from "../_config/constant";

@Injectable({
  providedIn: 'root'
})
export class PacientService {

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
}

export const baseUrl = env.baseUrl;

