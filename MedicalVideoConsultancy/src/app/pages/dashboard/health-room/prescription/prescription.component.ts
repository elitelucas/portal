import { Component, OnInit } from '@angular/core';
import { DataService } from "../../../../_services/data.service";
import { ProviderService } from "../../../../_services/provider.service";


@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {
  prescriptions=[];
  message:any;
  constructor(private data: DataService,private providerService: ProviderService) { }

  ngOnInit(): void {
    this.data.currentMessage.subscribe(message => {
      this.message = message    
    })
  }
  
  AddPrescription(prescriptionInput: string) {
    if (prescriptionInput) {
      this.prescriptions.push(prescriptionInput);
    }
  }
  DeleteItem(idx){
    this.prescriptions.splice(idx,1);
  }
  sendPrescription(){
    this.providerService.sendMail().subscribe(result=>{
      console.log('result');
      console.log(result);
    })
  }

}
