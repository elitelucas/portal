import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {
  prescriptions=[];

  constructor() { }

  ngOnInit(): void {
  }
  
  AddPrescription(prescriptionInput: string) {
    if (prescriptionInput) {
      this.prescriptions.push(prescriptionInput);
    }
  }
  DeleteItem(idx){
    this.prescriptions.splice(idx,1);
  }

}
