import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  data:any;
  constructor(
    private activatedroute: ActivatedRoute
  ) {
    this.activatedroute.params.subscribe(data => {
      this.data=data;
    })
  }

  ngOnInit(): void {
  }

}
