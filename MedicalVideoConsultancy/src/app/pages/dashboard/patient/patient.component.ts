import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Patient } from '../../../_model/user';
import { ProviderService } from '../../../_services/provider.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  patientId = null;
  data: Patient;
  constructor(
    private activatedRoute: ActivatedRoute,
    private providerService: ProviderService,
  ) {
    this.activatedRoute.params.subscribe(data => {
      this.patientId = data.id;
      this.providerService.getPatient(this.patientId, "id").subscribe((patient : Patient) => {
        this.data = patient;
      })
    })
  }

  ngOnInit(): void {
  }

}
