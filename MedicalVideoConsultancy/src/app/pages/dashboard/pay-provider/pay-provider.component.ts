import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {UserService} from "../../../_services/user.service";
import {AuthService} from "../../../_services/auth.service";
import {environment} from "../../../../environments/environment";

export interface PayData {
  QRimg:object[];
  account: string[];
  url: string[];
}

@Component({
  selector: 'app-pay-provider',
  templateUrl: './pay-provider.component.html',
  styleUrls: ['./pay-provider.component.css']
})
export class PayProviderComponent implements OnInit {
  publicUrl = environment.baseUrl + "public/image/";
  data:any;
  currentUser: any;
  payData:PayData;
  constructor(
    private activatedroute: ActivatedRoute,
    private userService:UserService,
    private authService:AuthService
    ) {
    this.currentUser = this.authService.getCurrentUser; 
    this.activatedroute.params.subscribe(data => {
      this.data=data;
    })
    this.payData={
      QRimg:[],
      account:[],
      url:[]    
    }
  }

  ngOnInit(): void {
    this.userService.getPayData(this.currentUser.id).subscribe(res=>{
      this.payData=res;
    })
  }

}
