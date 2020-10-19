import { forwardRef, Inject, Injectable } from '@angular/core';
import { User, currentUser } from "../_model/user";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment as env } from "../../environments/environment";
import { catchError, map } from "rxjs/operators";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { constant } from "../_config/constant";

export const baseUrl = env.baseUrl;

@Injectable({
  providedIn: 'root'
})

export class AuthPatientService {

  public currentUser: Observable<currentUser>;
  private userSubject: BehaviorSubject<currentUser>;

  constructor(private http: HttpClient) {
    this.userSubject = new BehaviorSubject<currentUser>(JSON.parse(localStorage.getItem('currentPatient')));
    this.currentUser = this.userSubject.asObservable();
  }


  public signUp(userData) {
    const signUpUrl = baseUrl + 'auth/register';
    return this.http.post<any>(signUpUrl, userData).pipe(map(res => {
      return res;
    }));
  }

  public signIn(userData: User) {
    const signInUrl = baseUrl + 'auth/login';
    return this.http.post<any>(signInUrl, userData).pipe(map(res => {
      if (res.token) {
        this.setToken(res);
        this.setCurrentUser(res);
      }
      return res;
    }), catchError((error: HttpErrorResponse) => {
      if (error && error.status === 401) {
        return throwError(error);
      }
    })
    );
  }

  public setToken(result) {
    console.log(result);
    const now = new Date();
    localStorage.setItem('token', result.token);
    localStorage.setItem('tokenExpiredTime', JSON.stringify(constant.TTL + now.getTime()))
  }

  public getToken() {
    return localStorage.getItem('token');
  }

  public setCurrentUser(result) {
    console.log("setCurrentUser result");
    console.log(result);
    localStorage.setItem('currentPatient', JSON.stringify(result));
    this.userSubject.next(result)
  }

  public get getCurrentUser(): currentUser {
    return this.userSubject.value
  }

  public isLoggedIn() {
    return localStorage.getItem('token') !== null;
  }

  public logout() {
    if (this.getCurrentUser && this.getCurrentUser.role !== 'Admin') {
      //this.meetRoomService.desactiveProvider(this.getCurrentUser);
    }
    localStorage.removeItem('token');
  }

  public emailVerify(token) {
    const emailVerifyUrl = baseUrl + "auth/verify-email";
    return this.http.post<any>(emailVerifyUrl, { token: token });
  }

  public smsVerify(code, token) {
    const smsVerifyUrl = baseUrl + "auth/verify-sms";
    return this.http.post<any>(smsVerifyUrl, { code, token: token });
  }

  public join(patientData) {
    console.log("patientData");
    console.log(patientData);
    const joinUrl = baseUrl + "auth/join";
    return this.http.post<any>(joinUrl, patientData)
  }
  
  public joinValidatePatient(patientData ) : Observable<{} | any> {
    console.log("joinValidatePatient");
    console.log(patientData);
    const joinUrl = baseUrl + "auth/join/validate/patient";
    return this.http.post<any>(joinUrl, patientData).pipe(
      map(res => {
        if (res.token) {
          this.setToken(res);
          this.setCurrentUser(res.patient);
        }
        return res;
      }), catchError(err => {
        return throwError(err);
      })
      
      );
  }
}

