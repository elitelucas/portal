import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';



@Component({
  selector: 'app-preview-prescription',
  templateUrl: './preview-prescription.component.html',
  styleUrls: ['./preview-prescription.component.css']
})
export class PreviewPrescriptionComponent implements OnInit {


  constructor(
    @Inject(MAT_DIALOG_DATA) public sendHtmlStr) {


  }

  ngOnInit(): void {

  }

}
