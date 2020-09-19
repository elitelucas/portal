import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {UserService} from "../../../_services/user.service";
import {AuthService} from "../../../_services/auth.service";
import {environment} from "../../../../environments/environment";
import { MeetRoomService } from './../../../_services/meet-room.service';

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
  QRimgKey=[];
  accountKey=false;
  urlKey=false;
  dniPatient:any;
  constructor(
    private activatedroute: ActivatedRoute,
    private userService:UserService,
    private authService:AuthService,
    private meetRoomService:MeetRoomService
    ) {
    this.currentUser = this.authService.getCurrentUser; 
    this.dniPatient = localStorage.getItem('patient_dni');

    this.activatedroute.params.subscribe(data => {
      this.data=data;
    })
    this.QRimgKey[0]=false;
    this.QRimgKey[1]=false;
  }

  ngOnInit(): void {
    this.userService.getPayData(this.currentUser.id).subscribe(res=>{
      this.payData=res;
      if(res===null || res.length===0){
        this.payData={
          QRimg:[],
          account:[],
          url:[]
        }
      }
      if(this.payData){
        if(this.payData.QRimg[0]){
          this.QRimgKey[0]=true;
        }
        if(this.payData.QRimg[1]){
          this.QRimgKey[1]=true;
        }
        if(this.payData.account){
          this.accountKey=true;
        }
        if(this.payData.url){
          this.urlKey=true;
        }
      }
    })
    this.meetRoomService.createProviderRoom({providerId:this.currentUser.id,dni: this.dniPatient});
    this.meetRoomService.receiveProvideId().subscribe(ddd=>{
      console.log('ddd')
      console.log(ddd)
    })
  }
  sendPay(payAmount){
    // this.meetRoomService.sendPay(payAmount)
  }


}
