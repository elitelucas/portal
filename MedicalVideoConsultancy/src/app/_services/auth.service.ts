import {forwardRef, Inject, Injectable} from '@angular/core';
import {User, currentUser} from "../_model/user";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment as env} from "../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {constant} from "../_config/constant";
import {MeetRoomService} from "./meet-room.service";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
   public currentUser: Observable<currentUser>;
   private userSubject: BehaviorSubject<currentUser>;
  constructor(private  http: HttpClient, 
    @Inject(forwardRef(() => MeetRoomService)) private meetRoomService: MeetRoomService) {
    this.userSubject = new BehaviorSubject<currentUser>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.userSubject.asObservable();
  }


  public signUp(userData) {
    const signUpUrl = baseUrl + 'auth/register';
    return this.http.post<any>(signUpUrl, userData).pipe(map(res=> {
      return res;
    }));
  }

  public signIn(userData: User){
    const signInUrl = baseUrl + 'auth/login';
    return this.http.post<any>(signInUrl, userData).pipe(map(res => {
      if(res.token) {
 
        this.setToken(res);
        this.setCurrentUser(res);
      }
      return res;
    }), catchError( (error: HttpErrorResponse) => {
        if(error && error.status === 401) {
          return throwError( error );
        }
      })
    );
  }

  public setToken(result) {
    const now = new Date();
    localStorage.setItem('token', result.token.accessToken);
    localStorage.setItem('tokenExpiredTime',JSON.stringify(constant.TTL + now.getTime()))
  }

  public getToken() {
    return localStorage.getItem('token');
  }

  public setCurrentUser(result) {
    console.log("setCurrentUser");
    console.log(result);
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    this.userSubject.next(result.user)
  }

  
  public refreshCurrentUser(user) {
    console.log("refreshCurrentUser");
    console.log(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSubject.next(user)
  }

  public get getCurrentUser(): currentUser {
    return this.userSubject.value
  }
  public isLoggedIn(){
    return localStorage.getItem('token') !== null; }

  public logout(){
    if(this.getCurrentUser && this.getCurrentUser.role !== 'Admin') {
      //this.meetRoomService.desactiveProvider(this.getCurrentUser);
    }
    localStorage.removeItem('token');
  }

  public emailVerify(token) {
    const emailVerifyUrl = baseUrl + "auth/verify-email/"+token;
    return this.http.post<any>(emailVerifyUrl, {});
  }

  public smsVerify(code, token) {
    const smsVerifyUrl = baseUrl + "auth/verify-sms";
    return this.http.post<any>(smsVerifyUrl, {code, token:token});
  }

  public join(patientData) {
    const joinUrl = baseUrl + "auth/join";
    return this.http.post<any>(joinUrl, patientData)
  }
}

export const baseUrl = env.baseUrl;
