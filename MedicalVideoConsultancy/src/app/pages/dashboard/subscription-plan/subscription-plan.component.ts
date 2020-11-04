import { Component, OnInit } from '@angular/core';
import { ProviderService } from './../../../_services/provider.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-plan',
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.css']
})
export class SubscriptionPlanComponent implements OnInit {
  providerData: any;
  planData: any;
  displayPlan = false;

  constructor(
    private providerService: ProviderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    localStorage.removeItem("plan_supcription");
    this.providerData = JSON.parse(localStorage.getItem('currentUser'));
    console.log("getPlanSupcriptio a");
    console.log(this.providerData.id);
    this.providerService.getPlanSupcription(this.providerData.id).subscribe(res => {
      console.log("getPlanSupcription b");
      console.log(res);
      if (res) {
        if (res["subcription"]["status"] == "active") {
          localStorage.setItem("plan_supcription", JSON.stringify(res));
          this.router.navigateByUrl('/dashboard/subscription-old');
        }
      } else {
        this.providerService.getPlans().subscribe(res => {
          this.planData = res;
          this.displayPlan = true;
        })
      }
    }, err => {
      this.providerService.getPlans().subscribe(res => {
        this.planData = res;
        this.displayPlan = true;
      })
    });

  }

  selectPlan(planId) {
    localStorage.removeItem("plan_select");
    const sendData = { key: 'new', val: planId }
    localStorage.setItem("plan_select", JSON.stringify(sendData));
    this.router.navigateByUrl('/dashboard/subscription-new');
  }

}
