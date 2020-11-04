import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort} from "@angular/material";
import {DialogBoxComponent} from "../dialog-box/dialog-box.component";
import {UserService} from "../../../_services/user.service";
import {ActivatedRoute,  Router} from "@angular/router";
import Swal from 'sweetalert2';

export interface UsersData {
  userId: number;
  name: string;
  role: string;
  email: string;
  phoneNumber: string;
  permission: string;
  status: string;
  createdAt: Date;
}


@Component({
  selector: 'app-super-administrators',
  templateUrl: './super-administrators.component.html',
  styleUrls: ['./super-administrators.component.css']
})

export class SuperAdministratorsComponent implements OnInit {

  displayedColumns: string[] = ['userId', 'name', 'role','email', 'phoneNumber','permission', 'status', 'createdAt', 'action'];
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
    this.userService.getAdmins().subscribe(res=> {
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
        userData.push({userId: item._id, name: item.firstName +" " + item.lastName, role: item.role, email: item.email, phoneNumber: item.phoneNumber, status: item.status,permission: item.permission, createdAt: item.createdAt});
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
    const permission = event.value;
    element.permission = permission;
    //Check if email or phone number.
    this.userService.updateUserData(element)
      .subscribe(res=> {
        if(permission.includes("Email")) {
          this.userService.sendEmail(element)
            .subscribe(res=> {
              console.log("Email verification success", res)
          })
        } else if (permission.includes("SMS")){
          this.userService.sendSMS(element)
            .subscribe(res=> {
              console.log("SMS verification success", res);
            })
        }
      },error => {
        console.log("error verification success", error.error)
        Swal.fire('Error user : ' ,error.error.error)
      })
  }


  openDialog(action, obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '600px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        if (result.event == 'Update') {
          this.updateRowData(result.data);
        } else if (result.event == 'Delete') {
          this.deleteRowData(result.data);
        }
      }
    });
  }


  updateRowData(row_obj) {
    this.dataSource = this.dataSource.filteredData.filter((value, key) => {
      if (value.userId == row_obj.userId) {
        value.role = row_obj.role;
        value.room = row_obj.room;
        this.userService.updateUserData(value).subscribe(res=> {console.log("Updated successfully", res)})
      }
      return value;
    });
    this.arrangeDataSource();
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


