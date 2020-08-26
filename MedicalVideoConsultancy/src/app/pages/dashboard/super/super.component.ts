import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatTable, MatPaginator, MatTableDataSource, MatSort} from "@angular/material";
import {DialogBoxComponent} from "../dialog-box/dialog-box.component";
import {UserService} from "../../../_services/user.service";
import {Router} from "@angular/router";

export interface UsersData {
  userId: number;
  name: string;
  role: string;
  room: string;
  email: string;
  cmp: string;
  phoneNumber: string;
  permission: string;
  status: string;
  createdAt: Date;
}


@Component({
  selector: 'app-super',
  templateUrl: './super.component.html',
  styleUrls: ['./super.component.css'],
})

export class SuperComponent implements OnInit {

  displayedColumns: string[] = ['userId', 'name', 'role', 'room', 'email', 'cmp','phoneNumber','permission', 'status', 'createdAt', 'action'];
  noDataToDisplay: boolean = false;
  dataSource: any;

  @ViewChild(MatTable)  table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(public dialog: MatDialog, private userService: UserService, private router: Router) {
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
        userData.push({userId: item.id, name: item.firstName +" " + item.lastName, role: item.role, room: item.room, email: item.email, cmp: item.cmp, phoneNumber: item.phoneNumber, status: item.status,permission: item.permission, createdAt: item.createdAt});
      }
    });

    console.log(userData)
    this.dataSource = new MatTableDataSource<UsersData>(userData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
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


}
