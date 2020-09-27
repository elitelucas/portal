import { FormGroup, FormBuilder,Validators } from '@angular/forms';
import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort} from "@angular/material";
import { ProviderService } from './../../../_services/provider.service';
import {Router} from "@angular/router";

export interface PatientData {
  id:string;
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

  displayedColumns: string[] = ['dni', 'fullName', 'consultCnt', 'lastConsult','detail'];
  noDataToDisplay: boolean = false;
  dataSource: any;
  providerId:any;
  searchForm:FormGroup;
  submitted:boolean=false;

  @ViewChild(MatTable)  table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog, 
    private providerService: ProviderService, 
    private router: Router,
    private formBuilder:FormBuilder
    ) {

  }


  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      matInput: ['', [Validators.required, Validators.pattern("[a-zA-Z ]*^[0-9]*")]]
    });
    this.initData();
  }

  initData() {
    this.providerId=JSON.parse(localStorage.getItem('currentUser')).id;
    this.providerService.getInitPatientsData(this.providerId,'id').subscribe(res=> {
      if(res) {
        console.log("patient data s>>>>>>>>>>>>>", res)
        this.initDataSource(res)
        this.noDataToDisplay = false;
      } else{
        this.noDataToDisplay = true;
      }
    })
  }

  initDataSource(data) {
    const PatientData: PatientData[] = [];
    data.forEach(function(item){
      if(item) {
        PatientData.push({ id: item.id, dni: item.dni, fullName: item.fullName, consultCnt: item.consultCnt, lastConsult: item.lastConsult});
      }
    });

    console.log(PatientData)
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
     
      // this.providerService.getFilterPatientsData(this.providerId,'id').subscribe(res=> {
      //   if(res) {
      //     console.log("patient data s>>>>>>>>>>>>>", res)
      //     this.initDataSource(res)
      //     this.noDataToDisplay = false;
      //   } else{
      //     this.noDataToDisplay = true;
      //   }
      // })
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  arrangeDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  detail(param){
    this.router.navigateByUrl('/dashboard/patient/'+param.id+'/'+param.dni+'/'+param.fullName);
  }
}

