import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort } from "@angular/material";
import { ProviderService } from './../../../_services/provider.service';
import { Router } from "@angular/router";
import { AddPatientComponent } from './add-patient/add-patient.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';


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
  searchForm: FormGroup;
  submitted: boolean = false;

  limit = 10;
  page = 1;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private providerService: ProviderService,
    private formBuilder: FormBuilder,
    private router: Router) {
  }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      dniInput: ['', Validators.maxLength(8)],
      fullNameInput: ['', Validators.maxLength(100)]
    });
    this.initData();
  }

  initData() {
    this.providerId = JSON.parse(localStorage.getItem('currentUser')).id;
    this.applyFilter();
    //this.refreshList();
  }

  /* refreshList() {
     this.providerService.getAllPatientsData(this.providerId, "", "", this.limit, this.page).subscribe(res => {
       if (res) {
         console.log("patient data s>>>>>>>>>>>>>", res)
         this.initDataSource(res)
         this.noDataToDisplay = false;
       } else {
         this.noDataToDisplay = true;
       }
     });
   }*/

  newPatient() {
    const dialogRef = this.dialog.open(AddPatientComponent, {
      width: '75%',
      height: '70%',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      let param = {
        id: result.resultPatient.patient._id
      }
      //this.refreshList();
      this.detail(param)
    })

  }

  initDataSource(data) {
    const PatientData: PatientData[] = [];
    data.docs.forEach(function (item) {
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
    console.log("this.dataSource.paginator");
    console.log(this.dataSource.paginator);

  }
  get f() { return this.searchForm.controls; }

  applyFilter() {

    this.submitted = true;
    const dniValue = this.f.dniInput.value;
    const fullNamevalue = this.f.fullNameInput.value;

    if (this.searchForm.invalid) {
      Swal.fire('Invalid values');
      console.log(this.searchForm.value);
      return;
    }

    this.providerService.getAllPatientsData(this.providerId, dniValue, fullNamevalue, this.limit, this.page).subscribe(res => {
      if (res !== 'fail') {
        console.log("patient data s>>>>>>>>>>>>>", res)
        this.initDataSource(res)
        this.noDataToDisplay = false;
      } else {
        Swal.fire('There is no such dni or fullName.')
        this.noDataToDisplay = true;
      }
    })



    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onPageFired(event) {
    console.log("event");
    console.log(event);
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize ;
    this.applyFilter();

  }


  arrangeDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  detail(param) {
    this.router.navigateByUrl('/dashboard/patient/' + param.id);
  }

}

