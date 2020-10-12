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
  displayPlan=false;

  constructor(
    private providerService:ProviderService,
    private router:Router
    ) { }

  ngOnInit(): void {
    this.providerData=JSON.parse(localStorage.getItem('currentUser'));

    if(this.providerData.subcriptionStatus){
      this.router.navigateByUrl('/dashboard/subscription-old')
    }
    else{
    this.providerService.getPlans().subscribe(res=>{

      this.planData=res;
      this.displayPlan=true;
    })
    }   
  }
  Subscribe(planId){
    const sendData={key:'new',val:planId}
    this.router.navigateByUrl('/dashboard/subscription-new/'+JSON.stringify(sendData));
  }

}
