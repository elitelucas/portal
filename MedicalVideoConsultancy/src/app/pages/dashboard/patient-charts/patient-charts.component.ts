import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort } from "@angular/material";
import { ProviderService } from './../../../_services/provider.service';
import { Router } from "@angular/router";
import { AddPatientComponent } from './add-patient/add-patient.component';
import { FormGroup, FormBuilder,Validators } from '@angular/forms';
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
  searchForm:FormGroup;
  submitted:boolean=false;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private providerService: ProviderService,
    private formBuilder:FormBuilder,
    private router: Router) {
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
    /*this.ProviderService.getAllPatientsData(this.providerId, 'id').subscribe(res => {
      if (res) {
    this.providerId=JSON.parse(localStorage.getItem('currentUser')).id;*/
    this.providerService.getInitPatientsData(this.providerId,'id').subscribe(res=> {
      if(res) {
        console.log("patient data s>>>>>>>>>>>>>", res)
        this.initDataSource(res)
        this.noDataToDisplay = false;
      } else {
        this.noDataToDisplay = true;
      }
    });
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

  applyFilter() {
    this.submitted=true;
    const filterValue = this.f.matInput.value;
  
    if(filterValue){
      console.log('filterValue')
      console.log(filterValue)
    }
      
      if (this.searchForm.invalid) {
        return;
      }

    const validateDni=/^\d*$/.test(filterValue);
    const validateName=/^[a-zA-Z ]*$/.test(filterValue);
    if(validateDni || validateName){
      var key='';
      console.log('sdf')
      if(validateDni){
        key='dni';
      }else{
        key='name';
      }
        this.providerService.getFilterPatientsData(this.providerId,filterValue,key).subscribe(res=> {
          if(res!=='fail') {
            console.log("patient data s>>>>>>>>>>>>>", res)
            this.initDataSource(res)
            this.noDataToDisplay = false;
          } else{
            Swal.fire('There is no such dni or fullName.')
            this.noDataToDisplay = true;
          }
        })      
    }else{
      Swal.fire('Input correctly!')
    }
     
      
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  arrangeDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  detail(param) {
    this.router.navigateByUrl('/dashboard/patient/' + param.id);
  }

}

