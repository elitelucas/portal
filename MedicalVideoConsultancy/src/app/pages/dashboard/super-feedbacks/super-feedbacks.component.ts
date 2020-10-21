import { Provider } from './../../../_model/user';
import { Component, OnInit } from '@angular/core';
import { ProviderService } from '../../../_services/provider.service';
@Component({
  selector: 'app-super-feedbacks',
  templateUrl: './super-feedbacks.component.html',
  styleUrls: ['./super-feedbacks.component.css']
})
export class SuperFeedbacksComponent implements OnInit {

  providerData: any;
  iteralData: any;

  constructor(private providerService: ProviderService) {
    this.providerData = JSON.parse(localStorage.getItem('currentUser'));
    /*console.log('this.providerData')
    console.log(this.providerData)*/
  }

  ngOnInit(): void {

    this.providerService.getFeedbacks(this.providerData.id).subscribe(res => {
      /*console.log('res')
      console.log(res)*/
      let tmpIteralData = res;
      let arr = [];
      const len = Math.floor(tmpIteralData.length / 3);
      for (let i = 0; i <= len; i++) {
        arr[i] = [];
        tmpIteralData.forEach((element, index) => {
          if (Math.floor(index / 3) === i) {
            arr[i].push(element);
          }
        });
      }
      this.iteralData = arr;
      /*console.log('this.iteralData')
      console.log(this.iteralData)*/

    })
  }

}
