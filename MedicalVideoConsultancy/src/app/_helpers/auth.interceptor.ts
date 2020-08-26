import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import {AuthService} from "../_services/auth.service";
import {Router} from "@angular/router";

const TOKEN_HEADER_KEY = 'authorization';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let authReq = req;
    const token = this.authService.getToken();
    const now = new Date();
    const tokenExpiredTime = JSON.parse(localStorage.getItem('tokenExpiredTime'));
    if (token != null) {
      if(now.getTime() - tokenExpiredTime > 0) {
        this.handleExpiredToken();
      } else{
        authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
      }
    }
    return next.handle(authReq);
  }

  private handleExpiredToken() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
