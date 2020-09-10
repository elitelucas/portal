import {Component, OnInit, ViewChild, ViewEncapsulation, Input} from '@angular/core';
import {MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort} from "@angular/material";
import { ProviderService } from './../../../../_services/provider.service';
import {Router} from "@angular/router";

export interface IdName {
  id:string;
  fullName: string;
}

export interface PatientData {
  patientId:string;
  date: Date;
}


@Component({
  selector: 'app-consult-list',
  templateUrl: './consult-list.component.html',
  styleUrls: ['./consult-list.component.css']
})

export class ConsultListComponent implements OnInit {

  displayedColumns: string[] = [ 'id', 'fullName','date','consult'];
  noDataToDisplay: boolean = false;
  dataSource: any;
  @Input() idName: IdName;
  @ViewChild(MatTable)  table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(public dialog: MatDialog, private ProviderService: ProviderService, private router: Router) {
  
  }
  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.ProviderService.getConsult(this.idName.id,'id').subscribe(res=> {
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
    data.forEach(function(item){
      if(item) {
        PatientData.push({ patientId:item.patientId, date: item.date});
      }
    });

    console.log(PatientData)
    this.dataSource = new MatTableDataSource<PatientData>(PatientData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    console.log('event.target')
    console.log(event.target)
    const filterValue = (event.target as HTMLInputElement).value;
    console.log('filterValue')
    console.log(filterValue)
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  arrangeDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  detail(data){
    this.router.navigateByUrl('/dashboard/newConsult/'+data.id+'/'+data.date);
  }
  search(){

  }
}


