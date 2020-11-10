import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import {UserService} from "../../../_services/user.service";
import {Router} from "@angular/router";
import {DialogBoxComponent} from "../dialog-box/dialog-box.component";
import {AuthService} from "../../../_services/auth.service";

export interface UsersData {
  userId: number;
  email: string;
  role: string;
  createdAt: Date;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  currentUser: any;
  displayedColumns: string[] = ['userId', 'email', 'role', 'createdAt','action'];
  noDataToDisplay: boolean = false;
  dataSource: any;

  @ViewChild(MatTable)  table: MatTable<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(public dialog: MatDialog, private userService: UserService, private router: Router, private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser;
  }


  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.userService.getUsers().subscribe(res=> {
      if(res) {
        if(res.name) {
          console.log("Token expired")
          this.router.navigateByUrl('/auth/sign-in')
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
    console.log('data')
    console.log(data)
    const userData: UsersData[] = [];
    data.forEach(function(item){
      if(item) {
        if(item.role !== "Admin")
        userData.push({userId: item.id,email:item.email, role: item.role, createdAt: item.createdAt});
      }
    });
    this.dataSource = new MatTableDataSource<UsersData>(userData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    this.dataSource = this.dataSource.filter((value, key) => {
      if (value.userId == row_obj.userId) {
        value.role = row_obj.role;
        value.room = row_obj.room;
        this.userService.updateUserData(value).subscribe(res=> {console.log("Updated successfully", res)})
      }
      return value;
    });
  }

  deleteRowData(row_obj) {
    this.dataSource = this.dataSource.filter((value, key) => {
      this.userService.deleteUserData(row_obj).subscribe(res=> {console.log("Deleted successfully", res)})
      return value.userId != row_obj.userId;
    });
  }
}
