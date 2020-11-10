import { Component } from '@angular/core';
import {AuthService} from "../../../../_services/auth.service";
import {Router} from "@angular/router";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class AppHeaderComponent {
  currentUser: any;
  publicUrl = environment.baseUrl + "public/image/";
  constructor(private authService: AuthService, private route: Router) { this.currentUser = this.authService.getCurrentUser;}
  viewProfile() {
    const userProfile = "dashboard/profile";
    this.route.navigateByUrl(userProfile)
  }
  logout() {
    this.authService.logout();
    this.route.navigateByUrl('');
  }
}
