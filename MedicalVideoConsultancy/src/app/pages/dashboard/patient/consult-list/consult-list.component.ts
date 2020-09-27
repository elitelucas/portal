import {Component, OnInit, ViewChild, ViewEncapsulation, Input} from '@angular/core';
import {MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort} from "@angular/material";
import { ProviderService } from './../../../../_services/provider.service';
import {Router} from "@angular/router";
import  Swal  from 'sweetalert2';


export interface IdName {
  id:string;
  dni:string;
  fullName: string;
}

export interface PatientData {
  index:number;
  patientId:string;
  date: Date;
  consultId:string
}


@Component({
  selector: 'app-consult-list',
  templateUrl: './consult-list.component.html',
  styleUrls: ['./consult-list.component.css']
})

export class ConsultListComponent implements OnInit {

  displayedColumns: string[] = [ 'index', 'fullName','date','consult'];
  noDataToDisplay: boolean = false;
  dataSource: any;
  @Input() idName: IdName;
  @ViewChild(MatTable)  table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(public dialog: MatDialog, private providerService: ProviderService, private router: Router) {
  
  }
  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.providerService.getInitConsult(this.idName.id)
    .subscribe(res=>{
      if(res) {
        console.log("consult data s>>>>>>>>>>>>>", res)
        this.initDataSource(res)
        this.noDataToDisplay = false;
      } else{
        this.noDataToDisplay = true;
      }
    })
  }

  initDataSource(data) {
    const PatientData: PatientData[] = [];
    data.forEach(function(item,idx){
      if(item) {
        PatientData.push({index:idx+1, patientId:item.patientId, date: item.createdAt,consultId:item._id});
      }
    });

    console.log(PatientData)
    this.dataSource = new MatTableDataSource<PatientData>(PatientData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  arrangeDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  detail(data){
    this.router.navigateByUrl('/dashboard/newConsult/'+data.index+'/'+data.id+'/'+data.consultId);
  }
  search(startDate,endDate){
    if(startDate==='' || endDate==='' || endDate>startDate==false){
      Swal.fire('Input the date correctly.')
      return;
    }
    this.providerService.getConsult(this.idName.id,startDate,endDate)
    .subscribe(res=> {
      if(res) {
        console.log("consult data s>>>>>>>>>>>>>", res)
        this.initDataSource(res)
        this.noDataToDisplay = false;
      } else{
        this.noDataToDisplay = true;
      }
    })
  }
}


