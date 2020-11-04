import { Component, OnInit } from '@angular/core';
import { ProviderService } from './../../../_services/provider.service';
import { UserService } from './../../../_services/user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../_services/auth.service';
import { MeetRoomService } from '../../../_services/meet-room.service';


@Component({
  selector: 'app-subscription-old',
  templateUrl: './subscription-old.component.html',
  styleUrls: ['./subscription-old.component.css']
})
export class SubscriptionOldComponent implements OnInit {

  currectUser: any;

  planData: any;
  cardData: any;
  currentPlan: any;
  otherPlan = [];
  newCardVal: any;
  newPlanVal: any;
  updateKey = false;
  iteralData = [];
  plan_supcription: any;
  constructor(
    private authService: AuthService,
    private meetRoomService: MeetRoomService,
    private providerService: ProviderService,
    private userService: UserService,
    private router: Router
  ) {
    this.currectUser = this.authService.getCurrentUser
    this.plan_supcription = JSON.parse(localStorage.getItem("plan_supcription"));
  }

  ngOnInit(): void {
    console.log("this.plan_supcription");
    console.log(this.plan_supcription);

    if (this.plan_supcription.card) {
      this.cardData = this.plan_supcription.card
    }
    if (this.plan_supcription.plan._id) {
      this.providerService.getPlans()
        .subscribe(res => {
          this.planData = res;
          this.planData.forEach(element => {
            if (this.plan_supcription.plan._id === element._id)
              this.currentPlan = element;
            else
              this.otherPlan.push(element)
          });
        })
    }

  }

  Delete() {

  }

  addCard() {
    const sendData = {
      key: 'update',
      val: this.currentPlan._id
    }
    localStorage.setItem("plan_select", JSON.stringify(sendData));
    this.router.navigateByUrl('/dashboard/subscription-new');
  }

  Upgrade(item) {
    console.log(item);
    Swal.fire({
      title: 'Are you sure?',
      text: "Plan select " + item.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      this.currentPlan = item;
      this.Save();
    });
  }

  Save() {
    this.currentPlan.id = this.currectUser.planId;
    this.cardData.providerId = this.currectUser.id
    this.providerService.changeSubscribePlan(this.currectUser.id, this.currentPlan._id).subscribe(res => {
      Swal.fire('Updated successfully!').then((result) => {
      this.router.navigated = false;
      this.reloadCurrentRoute('/dashboard/subscription-plan');
      });
    }, err => {
      Swal.fire('Error al cambiar de subcripcion');
    });
  }

  cancelSubscription() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.plan_supcription.plan.type == "charge") {
          this.providerService.cancelCharge(this.currectUser.id)
            .subscribe(res => {
              this.continuesCancelations();
            });
        }
        if (this.plan_supcription.plan.type == "subcription") {
          this.providerService.cancelSupcription(this.currectUser.id)
            .subscribe(res => {
              this.continuesCancelations();
            });
        }
      }
    });
  }

  continuesCancelations() {
    Swal.fire('Cancelation successfully').then((result) => {
      this.currectUser.payToDay = false
      this.authService.refreshCurrentUser(this.currectUser);
      this.router.navigated = false;
      this.reloadCurrentRoute('/dashboard/subscription-plan');
    });
  }

  reloadCurrentRoute(url) {
    this.router.navigate([url]).then(() => {
      window.location.reload();
    });;
  }

}
