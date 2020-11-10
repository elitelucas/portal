import { Component, Inject, NgZone, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { AuthService } from "../../../_services/auth.service";
import { environment } from "../../../../environments/environment";
import { ProviderService } from "../../../_services/provider.service";
import { Router } from "@angular/router";

import { HttpErrorResponse, HttpEventType } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { of } from "rxjs";
import Swal from 'sweetalert2';

export interface UploadData {
  index: number;
  id: string;
  type: string;
  name: string;
  provider: string;
  reportFile: string;
  status: string;
  createdAt: string;
}


@Component({
  selector: 'app-health-provider',
  templateUrl: './health-provider.component.html',
  styleUrls: ['./health-provider.component.css']
})
export class HealthProviderComponent implements OnInit {
  currentUser: any;

  patientsData = [];
  roomUrl: string;
  domain = environment.domain;
  smsData: any;
  noDevice: boolean = true;

  typeData: any;
  userData: any;
  sendType: any;
  fileName = [];
  tmpData = [];


  displayedColumns: string[] = ['index', 'type', 'name', 'provider', 'reportFile', 'status', 'createdDate'];
  noDataToDisplay: boolean = false;
  dataSource: any;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("fileUpload", { static: false }) fileUpload: ElementRef; files = [];

  constructor(
    private authService: AuthService,
    private providerService: ProviderService,
    public dialog: MatDialog,
    private router: Router,
    //private meetRoomService: MeetRoomService,
    private _ngZone: NgZone) {
    this.userData = JSON.parse(localStorage.getItem('currentUser'));
    console.log('this.userData')
    console.log(this.userData)
  }


  ngOnInit(): void {
    this.providerService.getFileType().subscribe(res => {
      console.log('type')
      console.log(res)
      this.typeData = res;
    });

    this.providerService.getUplodedFiles(this.userData.id).subscribe(res => {
      console.log('fies')
      console.log(res)
      if (res) {
        this.tmpData = res;
        this.initDataSource(res)
        this.noDataToDisplay = false;
      } else {
        this.noDataToDisplay = true;
      }
    })

  }

  uploadFile(file) {

    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('provider', this.userData.id);
    formData.append('type', this.sendType);
    file.inProgress = true;
    this.providerService.uploadFile(formData).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        return of(`${file.data.name} upload failed.`);
      })).subscribe((event: any) => {
        if (typeof (event) === 'object') {
          console.log('event')
          console.log(event)
          

          this.tmpData.push(event.body);
          this.initDataSource(this.tmpData);
          Swal.fire('Successfully uploaded!')
          setTimeout(() => {
            file.inProgress = false;
            file.progress = 0;
            this.files = [];
          }, 1000);
          this.fileName.push(event.body)
        }
      });
  }

  private uploadFiles() {

    this.fileUpload.nativeElement.value = '';
    this.files.forEach(file => {
      this.uploadFile(file);
    });
  }

  handleUpload(type) {

    if (type === undefined) {
      Swal.fire('Select the type!')
      return;
    }
    this.sendType = type;

    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      for (const f of fileUpload.files) {
        const file = f;
        this.files.push({ data: file, inProgress: false, progress: 0 });
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }


  initDataSource(data) {
    const UploadData: UploadData[] = [];
    data.forEach(function (item, idx) {
      if (item) {
        UploadData.push({
          index: idx + 1, id: item._id, type: item.typeCollection.name, name:
            item.fileName, provider: item.user.email, reportFile: item.reportFile, status: item.status, createdAt: item.createdAt
        });
      }
    });
    this.dataSource = new MatTableDataSource<UploadData>(UploadData);
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

}