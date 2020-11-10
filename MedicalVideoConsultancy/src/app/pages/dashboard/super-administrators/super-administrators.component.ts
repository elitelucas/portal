import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort} from "@angular/material";
import {DialogBoxComponent} from "../dialog-box/dialog-box.component";
import {UserService} from "../../../_services/user.service";
import {ActivatedRoute,  Router} from "@angular/router";
import Swal from 'sweetalert2';

export interface UsersData {
  userId: number;
  email: string;
  role: string;
  createdAt: Date;
}


@Component({
  selector: 'app-super-administrators',
  templateUrl: './super-administrators.component.html',
  styleUrls: ['./super-administrators.component.css']
})

export class SuperAdministratorsComponent implements OnInit {

  displayedColumns: string[] = ['userId', 'email', 'role', 'createdAt','action'];
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
    private activatedRoute:ActivatedRoute
    ) {
  }


  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.userService.getUsers().subscribe(res=> {
      if(res) {
        console.log("user data s>>>>>>>>>>>>>", res)
       if(res.name) {
         console.log("Token expired")
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
        userData.push({userId: item.id,email:item.email, role: item.role, createdAt: item.createdAt});
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


  

  deleteRowData(row_obj) {
    console.log("data source", this.dataSource)
    this.dataSource = this.dataSource.filteredData.filter((value, key) => {
      this.userService.deleteUserData(row_obj).subscribe(res=> {console.log("Deleted successfully", res)})
      return value.userId != row_obj.userId;
    });
    this.arrangeDataSource();
  }

  arrangeDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  New(){
    this.router.navigateByUrl('/dashboard/admin-update/new');
  }
  Update(userId){
    this.router.navigateByUrl('/dashboard/admin-update/'+userId);
  }
  Delete(providerId,idx){
  
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
        this.userService.deleteAdmin(providerId)
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


