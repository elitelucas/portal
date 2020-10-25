import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { ProviderService } from './../../../../_services/provider.service';
import { Chart, Patient } from './../../../../_model/user';
import { AuthService } from './../../../../_services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-free-text',
  templateUrl: './free-text.component.html',
  styleUrls: ['./free-text.component.css']
})
export class FreeTextComponent implements OnInit {

  @ViewChild('birthdate') birthdate: ElementRef;
  @ViewChild('phoneNumber') phoneNumber: ElementRef;

  @Input() patient: Patient;
  haveAlergy: boolean = false;
  dataToDisplay: boolean = false;
  chartData: Chart;
  currentUser: any;

  diseaseArr = [];
  medicationArr = [];
  alergiesArr = [];
  surgeryArr = [];
  familyArr = [];
  toxicArr = [];

  patientAge = 0;

  constructor(
    private providerService: ProviderService,
    //private authService:AuthService
  ) {

  }

  ngOnInit(): void {
    this.initData();
    let dateString = this.patient.birthdate + 'T00:00:00'
    let newDate = new Date(dateString);
    let timeDiff = Math.abs(Date.now() - newDate.getTime());
    let age = Math.floor((timeDiff / (1000 * 3600 * 24))/365.25);
    this.patientAge = age;

  }
  initData() {
    this.providerService.getChart(this.patient.dni).subscribe(res => {
      if (res) {
        if (res.disease)
          this.diseaseArr = res.disease;
        if (res.medication)
          this.medicationArr = res.medication;
        if (res.surgery)
          this.surgeryArr = res.surgery;
        if (res.family)
          this.familyArr = res.family;
        if (res.toxic)
          this.toxicArr = res.toxic;
        if (res.alergies) {
          this.alergiesArr = res.alergies;
          if (this.alergiesArr.length > 0) {
            this.haveAlergy = true
          }
        }
      }
    })
  }

  changeBirthDate(e) {
    let dateString = e.target.value + 'T00:00:00'
    let newDate = new Date(dateString);
    let timeDiff = Math.abs(Date.now() - newDate.getTime());
    let age = Math.floor((timeDiff / (1000 * 3600 * 24))/365.25);
    this.patientAge = age;
  }

  AddItem(Item: string, key: string) {
    if (Item) {
      if (key === 'disease')
        this.diseaseArr.push(Item);
      else if (key === 'medication')
        this.medicationArr.push(Item);
      else if (key === 'surgery')
        this.surgeryArr.push(Item);
      else if (key === 'alergies')
        this.alergiesArr.push(Item);
      else
        this.familyArr.push(Item);

      if (this.alergiesArr.length > 0) {
        this.haveAlergy = true
      }

    }
  }
  DeleteItem(idx, key) {
    if (key === 'disease')
      this.diseaseArr.splice(idx, 1);
    else if (key === 'medication')
      this.medicationArr.splice(idx, 1);
    else if (key === 'surgery')
      this.surgeryArr.splice(idx, 1);
    else if (key === 'alergies')
      this.alergiesArr.splice(idx, 1);
    else
      this.familyArr.splice(idx, 1);

    if (this.alergiesArr.length == 0) {
      this.haveAlergy = false
    }

  }

  saveAll(toxic0, toxic1, toxic2) {
    this.toxicArr = [toxic0, toxic1, toxic2];
    const sendData = {
      dni: this.patient.dni,
      disease: this.diseaseArr,
      medication: this.medicationArr,
      alergies: this.alergiesArr,
      surgery: this.surgeryArr,
      family: this.familyArr,
      toxic: this.toxicArr
    }

    const birthdateValue = this.birthdate.nativeElement.value;
    const phoneNumberValue = this.phoneNumber.nativeElement.value;
    this.patient.birthdate = birthdateValue;
    this.patient.phoneNumber = phoneNumberValue;

    this.providerService.updatePatientOnChart(this.patient).subscribe((patientUpdated: Patient) => {

    });

    this.providerService.editChart(sendData)
      .subscribe(res => {
        Swal.fire('Saved successfully')
      })
  }

  Cancel() {
    this.initData();
  }
}

