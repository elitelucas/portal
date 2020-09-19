import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {UserService} from "../../../_services/user.service";
import {AuthService} from "../../../_services/auth.service";
import {environment} from "../../../../environments/environment";
import { MeetRoomService } from '../../../_services/meet-room.service';

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
  
  @ViewChild('amountPayAttetion') public amountPayAttetion: ElementRef;

  publicUrl = environment.baseUrl + "public/image/";
  data:any;
  currentUser: any;
  payData:PayData;  
  patient = null;
  payRelease = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private userService:UserService,
    private authService:AuthService,
    private meetRoomService: MeetRoomService,
    private route: ActivatedRoute,
    private router: Router
    ) {
    this.currentUser = this.authService.getCurrentUser; 
    this.meetRoomService.confirmConnect(this.currentUser);
    this.activatedroute.params.subscribe(data => {
      this.data=data;
    })
    this.payData={
      QRimg:[],
      account:[],
      url:[]    
    }

    this.route.paramMap.subscribe(async (params) => {
      this.patient = JSON.parse(localStorage.getItem(params.get("patientId")));
    });
  }

  ngOnInit(): void {
    this.userService.getPayData(this.currentUser.id).subscribe(res=>{
      this.payData=res;
    });
    this.meetRoomService.confirmPayAttetionListener().subscribe(payProvider=>{
      this.payRelease = true;
    });
  }

  startAttetionPatientForPay(): void {
    const amountPayAttetion = this.amountPayAttetion.nativeElement.value
    this.meetRoomService.startAttetionPatientForPay(this.currentUser,this.patient, amountPayAttetion);
  }

  startAttetionPatient(): void {
    localStorage.setItem('provider_data', JSON.stringify(this.currentUser));
    localStorage.setItem( this.patient ._id, JSON.stringify( this.patient ));
    this.router.navigateByUrl('/dashboard/health-room/' +  this.patient._id);
  }
}
