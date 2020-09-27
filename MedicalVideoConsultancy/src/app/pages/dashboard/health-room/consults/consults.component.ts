import { User, Patient } from './../../../../_model/user';
import {Component, OnInit, ViewChild, ViewEncapsulation, Input} from '@angular/core';
import {MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort} from "@angular/material";
import { ProviderService } from './../../../../_services/provider.service';
import {Router} from "@angular/router";
import { ConsultDialogueComponent } from './../consult-dialogue/consult-dialogue.component';
import  Swal  from 'sweetalert2';

export interface PatientData {
  index:number;
  patientId:string;
  date: Date;
  consultId:string;
}

@Component({
  selector: 'app-consults',
  templateUrl: './consults.component.html',
  styleUrls: ['./consults.component.css']
})

export class ConsultsComponent implements OnInit {

  displayedColumns: string[] = [ 'index', 'fullName','date','consult'];
  noDataToDisplay: boolean = false;
  dataSource: any;
  tmpData=[];
  @Input() patient: Patient;
  @ViewChild(MatTable)  table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
   currentUser: User;

  constructor(public dialog: MatDialog, private providerService: ProviderService, private router: Router) {
    
  
  }
  ngOnInit(): void {
    this.providerService.getInitConsult(this.patient._id)
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
        console.log
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

    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  arrangeDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  detail(data){
    const dialogRef = this.dialog.open(ConsultDialogueComponent, {
      width: '75%',
      height:'70%',
      data: data
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   this.smsData = result;
    //   this.sendInvite(option);
    // })
    // this.router.navigateByUrl('/dashboard/newConsult/'+data.index+'/'+data.id+'/'+data.date);
  }
   search(startDate,endDate){
    if(startDate==='' || endDate==='' || endDate>startDate==false){
      Swal.fire('Input the date correctly.')
      return;
    }
    this.providerService.getConsult(this.patient._id,startDate,endDate)
    .subscribe(res=> {
      if(res) {
        console.log("consult data s>>>>>>>>>>>>>", res)
        this.tmpData=res;
        this.initDataSource(res)
        this.noDataToDisplay = false;
      } else{
        this.noDataToDisplay = true;
      }
    })
  }
}



