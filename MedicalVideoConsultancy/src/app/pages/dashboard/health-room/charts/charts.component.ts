import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {

  diseaseArr=[];
  medicationArr=[];
  surgeryArr=[];
  familyArr=[];
  constructor() { }

  ngOnInit(): void {
  }
  AddItem(Item: string,key:string) {
    if (Item) {
      console.log('Item')
      console.log(Item)
      console.log('key')
      console.log(key)
      if(key==='disease')
      this.diseaseArr.push(Item);
      else if(key==='medication')
      this.medicationArr.push(Item);
      else if(key==='surgery')
      this.surgeryArr.push(Item);
      else
      this.familyArr.push(Item);
    }
  }
  DeleteItem(idx,key){
    if(key==='disease')
    this.diseaseArr.splice(idx,1);
    else if(key==='medication')
    this.medicationArr.splice(idx,1);
    else if(key==='surgery')
    this.surgeryArr.splice(idx,1);
    else
    this.familyArr.splice(idx,1);
   
  }
}
