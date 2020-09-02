import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject, Subscription } from 'rxjs';

import {ProviderService} from '../../../_services/provider.service'

@Component({
  selector: 'app-patient-charts',
  templateUrl: './patient-charts.component.html',
  styleUrls: ['./patient-charts.component.css']
})
export class PatientChartsComponent implements OnInit{
  title = 'datatables';
  dtOptions: DataTables.Settings = {};
  posts;
  showContent;


  constructor(private ProviderService:ProviderService) {
    this.ProviderService.getAllPatientsData().subscribe((posts) => {
        this.posts = posts;
        console.log(posts)
    });
  }

  ngOnInit(): void {
    setTimeout(()=>this.showContent=true, 250);
    const that = this;
    this.dtOptions = {

      pagingType: 'full_numbers',
      pageLength: 5,
      processing: true,
      language: {
        searchPlaceholder: 'DNI or fullname',
      },
    };
  }
  detailPatient(id){
    console.log('id')
    console.log(id)
  }

}
