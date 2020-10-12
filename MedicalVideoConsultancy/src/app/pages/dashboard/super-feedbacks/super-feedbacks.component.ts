import { Provider } from './../../../_model/user';
import { Component, OnInit } from '@angular/core';
import { ProviderService } from './../../../_services/provider.service';
@Component({
  selector: 'app-super-feedbacks',
  templateUrl: './super-feedbacks.component.html',
  styleUrls: ['./super-feedbacks.component.css']
})
export class SuperFeedbacksComponent implements OnInit {

  providerData:any;

  constructor(private providerService:ProviderService) { 
    this.providerData = JSON.parse(localStorage.getItem('currentUser'));
    console.log('this.providerData')
    console.log(this.providerData)
  }

  ngOnInit(): void {

    this.providerService.getFeedbacks(this.providerData.id).subscribe(res=>{
      console.log('res')
      console.log(res)
    })
  }

}
