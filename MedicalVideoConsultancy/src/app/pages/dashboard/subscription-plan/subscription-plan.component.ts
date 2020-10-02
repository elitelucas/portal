import { Component, OnInit } from '@angular/core';
import { ProviderService } from './../../../_services/provider.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-plan',
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.css']
})
export class SubscriptionPlanComponent implements OnInit {
  providerData:any;
  planData:any;

  constructor(
    private providerService:ProviderService,
    private router:Router
    ) { }

  ngOnInit(): void {
    this.providerData=JSON.parse(localStorage.getItem('currentUser'));
    console.log('this.providerData')
    console.log(this.providerData)
    if(this.providerData.subcriptionId){
      this.router.navigateByUrl('/dashboard/subscription-old')
    }
    else{
    this.providerService.getPlans().subscribe(res=>{
      console.log('Res')
      console.log(res)
      this.planData=res;
    })
    }   
  }
  Subscribe(){
    this.router.navigateByUrl('/dashboard/subscription-new/'+this.planData[0].planId);
  }

}
