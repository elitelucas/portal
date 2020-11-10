import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort} from "@angular/material";
import {DialogBoxComponent} from "../dialog-box/dialog-box.component";
import {UserService} from "../../../_services/user.service";
import { ProviderService } from './../../../_services/provider.service';
import {ActivatedRoute,  Router} from "@angular/router";
import Swal from 'sweetalert2';
import { type } from 'jquery';

export interface UsersData {
  _id: string;
  fileName: string;
  user: string;
  type: string;
  status:string;
  reportFile:string;
  createdAt: string;
}


@Component({
  selector: 'app-super-uploaded-files',
  templateUrl: './super-uploaded-files.component.html',
  styleUrls: ['./super-uploaded-files.component.css']
})

export class SuperUploadedFilesComponent implements OnInit {

  displayedColumns: string[] = ['_id', 'fileName', 'user', 'type','status', 'reportFile','createdAt','action'];
  noDataToDisplay: boolean = false;
  dataSource: any;
  tmpData:any;

  @ViewChild(MatTable)  table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog, 
    private userService: UserService, 
    private router: Router,
    private activatedRoute:ActivatedRoute,
    private providerService:ProviderService
    ) {
  }


  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.providerService.getAllFiles().subscribe(res=> {
      if(res) {
        console.log("user data s>>>>>>>>>>>>>", res)
       if(res.name) {
         this.router.navigateByUrl('/super')
       } else  {
         this.tmpData=res;
         this.initDataSource(res);
       }
        this.noDataToDisplay = false;
      } else{
        this.noDataToDisplay = true;
      }
    })
  }

  initDataSource(data) {
    const userData: UsersData[] = [];
    data.forEach(function(item){
      if(item) {
        userData.push({_id: item._id,fileName:item.fileName, user: item.user.email,type:item.typeCollection.name,status:item.status,reportFile:item.reportFile, createdAt: item.createdAt});
      }
    });


    this.dataSource = new MatTableDataSource<UsersData>(userData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue) {
    const validateName=/^[a-zA-Z ]*$/.test(filterValue);
    if(validateName){
      this.userService.getAdminFilterData(filterValue)
      .subscribe(res=>{
        if(res){
          this.initDataSource(res);
          this.noDataToDisplay = false;

        }else{
          Swal.fire('Input Correctly.')
        }
      })
    }else{
      Swal.fire('Input Correctly.')
    }

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  changePermission(element, event) {

    const permission = event.target.value;
    //Check if email or phone number.
    this.userService.updatePermission(element.userId, permission)
      .subscribe(res=> {
        Swal.fire('Permission is changed.')
     
      })
  }


  openDialog(action, obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '600px',
      data: obj
    });

   
  }


  

  arrangeDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  New(){
    this.router.navigateByUrl('/dashboard/admin-update/new');
  }
  Update(id){
    this.router.navigateByUrl('/dashboard/upload-update/'+id);
  }
  Delete(fileId,idx){
  
    console.log('fileId')
    console.log(fileId)
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.providerService.deleteFile(fileId)
          .subscribe(res => {
            console.log('res')
            console.log(res)
            this.tmpData.splice(idx, 1);
            this.initDataSource(this.tmpData);

            Swal.fire(
              'Deleted!',
              'Your file has been deleted.',
              'success'
            )
          })
      }
    })
  }


}



