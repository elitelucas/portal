
import { Component, OnInit,Input } from '@angular/core';
import { ProviderService } from './../../../../_services/provider.service';
import { Chart, Patient } from './../../../../_model/user';
import { AuthService } from './../../../../_services/auth.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

export interface IdName {
  id:string;
  dni:string;
  fullName: string;
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {

  @Input() idName: IdName;
  dataToDisplay: boolean = false;
  chartData:Chart;
  currentUser: any;

  diseaseArr=[];
  medicationArr=[];
  surgeryArr=[];
  familyArr=[];
  toxicArr=[];
  patientDni:string;
  constructor(
    private providerService: ProviderService,
    private authService:AuthService,
    private activatedRoute:ActivatedRoute
    ) {
      this.activatedRoute.params.subscribe(data => {
        console.log('data')
        console.log(data)
      });
      this.patientDni=localStorage.getItem('patient_dni');
  }

   ngOnInit(): void {
    this.initData();
  }
  initData(){
    this.providerService.getChart(this.patientDni).subscribe(res=> {
      if(res){
        if(res.disease)
        this.diseaseArr=res.disease;
        if(res.medication)
        this.medicationArr=res.medication;
        if(res.surgery)
        this.surgeryArr=res.surgery;
        if(res.family)
        this.familyArr=res.family;
        if(res.toxic)
        this.toxicArr=res.toxic;
      }
    })
  }

  AddItem(Item: string,key:string) {
    if (Item) {
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
  saveAll(toxic0,toxic1,toxic2){
    this.toxicArr=[toxic0,toxic1,toxic2];
    const sendData={
      dni:this.patientDni,
      disease:this.diseaseArr,
      medication:this.medicationArr,
      surgery:this.surgeryArr,
      family:this.familyArr,
      toxic:this.toxicArr
    }
    this.providerService.editChart(sendData)
    .subscribe(res=>{
      Swal.fire('Saved successfully')
    })
  }
  Cancel(){
    this.initData();
  }
}


