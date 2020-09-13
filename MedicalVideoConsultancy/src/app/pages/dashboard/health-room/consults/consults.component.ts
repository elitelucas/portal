import { User, Patient } from './../../../../_model/user';
import {Component, OnInit, ViewChild, ViewEncapsulation, Input} from '@angular/core';
import {MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort} from "@angular/material";
import { ProviderService } from './../../../../_services/provider.service';
import {Router} from "@angular/router";

export interface PatientData {
  date: Date;
}


@Component({
  selector: 'app-consults',
  templateUrl: './consults.component.html',
  styleUrls: ['./consults.component.css']
})

export class ConsultsComponent implements OnInit {

  displayedColumns: string[] = [ 'id', 'fullName','date','consult'];
  noDataToDisplay: boolean = false;
  dataSource: any;
  tmpData=[];
  @Input() patient: Patient;
  @ViewChild(MatTable)  table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
   currentUser: User;

  constructor(public dialog: MatDialog, private ProviderService: ProviderService, private router: Router) {
    
  
  }
  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.ProviderService.getConsultInChat(this.patient._id, this.patient.providerId).subscribe(res=> {
      if(res) {
        console.log("consult data s>>>>>>>>>>>>>", res)
        this.initDataSource(res)
        this.tmpData=res;
        this.noDataToDisplay = false;
      } else{
        this.noDataToDisplay = true;
      }
    })
  }

  initDataSource(data) {
    console.log('data')
    console.log(data)
    const PatientData: PatientData[] = [];
    data.forEach(function(item){
      if(item) {
        PatientData.push({ date: item.date});
      }
    });

    console.log(PatientData)
    this.dataSource = new MatTableDataSource<PatientData>(PatientData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
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
  search(startDate,endDate){
    console.log('startDate')
    console.log(startDate)
    console.log(typeof(startDate))
    console.log('this.tmpData')
    console.log(this.tmpData)
    this.dataSource.data = this.tmpData;
    const fromDate = startDate;
    const toDate = endDate;
    this.dataSource.data = this.dataSource.data.filter(e=>e.date > fromDate && e.date < toDate ) ;
  }
}



