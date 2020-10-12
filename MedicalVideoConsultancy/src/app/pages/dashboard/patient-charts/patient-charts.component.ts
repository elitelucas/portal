import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort } from "@angular/material";
import { ProviderService } from './../../../_services/provider.service';
import { Router } from "@angular/router";
import { AddPatientComponent } from './add-patient/add-patient.component';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

export interface PatientData {
  id: string;
  dni: number;
  fullName: string;
  consultCnt: string;
  lastConsult: string;
}


@Component({
  selector: 'app-patient-charts',
  templateUrl: './patient-charts.component.html',
  styleUrls: ['./patient-charts.component.css'],
})

export class PatientChartsComponent implements OnInit {

  displayedColumns: string[] = ['dni', 'fullName', 'consultCnt', 'lastConsult', 'detail'];
  noDataToDisplay: boolean = false;
  dataSource: any;
  providerId: any;
  searchForm:FormGroup;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private ProviderService: ProviderService,
    private router: Router,
    private formBuilder:FormBuilder) {

  }


  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      matInput: ['', Validators.required]
    });
    this.initData();
  }

  initData() {
    this.providerId = JSON.parse(localStorage.getItem('currentUser')).id;
    this.refreshList();
  }

  refreshList() {
    this.ProviderService.getAllPatientsData(this.providerId, 'id').subscribe(res => {
      if (res) {
        this.initDataSource(res)
        this.noDataToDisplay = false;
      } else {
        this.noDataToDisplay = true;
      }
    })
  }

  newPatient() {
    const dialogRef = this.dialog.open(AddPatientComponent, {
      width: '75%',
      height: '70%',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      let param = {
        id : result.resultPatient.patient._id
      }
      this.refreshList();
      this.detail(param)
    })

  }

  initDataSource(data) {
    const PatientData: PatientData[] = [];
    data.forEach(function (item) {
      if (item) {
        PatientData.push({
          id: item.id,
          dni: item.dni,
          fullName: item.fullName,
          consultCnt: item.consultCnt,
          lastConsult: item.lastConsult
        });
      }
    });
    this.dataSource = new MatTableDataSource<PatientData>(PatientData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  get f() { return this.searchForm.controls; }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  arrangeDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  detail(param) {
    this.router.navigateByUrl('/dashboard/patient/' + param.id);
  }

}

