import { Component, OnInit } from '@angular/core';
import { ProviderService } from './../../../_services/provider.service';

@Component({
  selector: 'app-subscription-old',
  templateUrl: './subscription-old.component.html',
  styleUrls: ['./subscription-old.component.css']
})
export class SubscriptionOldComponent implements OnInit {
  providerData:any;
  planData:any;
  cardData:any;
  constructor(private providerService:ProviderService) {
    this.providerData=JSON.parse(localStorage.getItem('currentUser'));
    console.log('this.providerData')
    console.log(this.providerData)

   }

  ngOnInit(): void {
    if(this.providerData.subcriptionId)
    this.providerService.getPlansById(this.providerData.subcriptionId)
    .subscribe(res=>{
      console.log('Res')
      console.log(res)
      this.planData=res;
    })
    this.providerService.getCard(this.providerData.id)
    .subscribe(res=>{
      console.log('Res1')
      console.log(res)
      this.cardData=res;
    })
  }
  Delete(){
    
  }

}
