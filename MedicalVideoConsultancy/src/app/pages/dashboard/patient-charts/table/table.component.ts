import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
   
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit{
  title = 'datatables';
  dtOptions: DataTables.Settings = {};
  posts=[
    {
      "id":"33",
      "title":"sd",
      "body":"ww"
    },
    {
      "id":"33",
      "title":"sd",
      "body":"ww"
    }
  ];
  
  constructor(private http: HttpClient) { }
  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      processing: true,
      language: {
        searchPlaceholder: 'DNI or fullname',
      }
    };
  
    // this.http.get('http://jsonplaceholder.typicode.com/posts')
    //   .subscribe(posts => {
    //     this.posts = posts;
    // });
  
  }
  
}