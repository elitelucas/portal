import { Provider, Consult } from './../../../_model/user';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {UserService} from "../../../_services/user.service";
import {AuthService} from "../../../_services/auth.service";
import {environment} from "../../../../environments/environment";
import { MeetRoomService } from './../../../_services/meet-room.service';
import { ProviderService } from './../../../_services/provider.service';

export interface PayData {
  QRimg:object[];
  account: string[];
  url: string[];
  payAmount:string;
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
  patientSocketId:string;
  confirmKey:boolean=false;
  consultData:any;
  constructor(
    private activatedroute: ActivatedRoute,
    private userService:UserService,
    private authService:AuthService,
    private meetRoomService:MeetRoomService,
    private _route:Router,
    private providerService:ProviderService
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
          url:[],
          payAmount:''
        }
      }
      if(this.payData){
        if(this.payData.QRimg){
          if(this.payData.QRimg[0]){
            this.QRimgKey[0]=true;
          }
          if(this.payData.QRimg[1]){
            this.QRimgKey[1]=true;
          }
        }else{
          this.payData.QRimg=[];
        }
        if(this.payData.account){
          this.accountKey=true;
        }else{
          this.payData.account=[];
        }
        if(this.payData.url){
          this.urlKey=true;
        }else{
          this.payData.url=[]
        }
      }
    })
    // this.meetRoomService.createProviderRoom({providerId:this.currentUser.id,dni: this.dniPatient});
  }
  async ngAfterViewInit(){
    this.meetRoomService.providerEnteredInPayProvider(this.currentUser,this.dniPatient);
    this.meetRoomService.patientEntered().subscribe(patientSocketId=>{
      if(patientSocketId){
        this.patientSocketId=patientSocketId;
        /*console.log('patientSocketId')
        console.log(patientSocketId)*/
      }else{
        alert('patient do not exist.')
      }
    })
    this.meetRoomService.receiveConfirmPay().subscribe(confirmPay=>{
      if(confirmPay){
        this.confirmKey=true;
      }
    })
  }
  sendPay(payAmount){
    this.payData.payAmount=payAmount;
    this.meetRoomService.sendPay(payAmount,this.patientSocketId);
  }
  Confirm(){
    this.meetRoomService.confirmProvider(this.dniPatient);
    const consultData={
      providerId:this.currentUser.id,
      patientId:this.data.patientId,
      dni:this.dniPatient,
      payment:this.payData
    }
    this.providerService.createConsult(consultData).subscribe(res=>{
      if(res){
        this.consultData=res;
        this._route.navigateByUrl('/dashboard/health-room/'+this.data.patientId+'/'+this.consultData._id);
      }
    })
   

  }


}
