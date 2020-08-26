import { NgModule } from '@angular/core';
import {RouterModule} from "@angular/router";
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { PatientComponent } from './patient/patient.component';
import {FrontRoutes} from "./front.routing";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatMenuModule} from "@angular/material/menu";



@NgModule({
  declarations: [
    HomeComponent,
    PatientComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(FrontRoutes),
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule
  ]
})
export class FrontModule { }
