import { NgModule } from '@angular/core';
import { Ng2TelInputModule } from "ng2-tel-input";
import { SharedModule } from "../shared/shared.module";


import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminComponent } from './admin/admin.component';
import { SuperComponent } from './super/super.component';
import { HealthProviderComponent, InviteBySms } from './health-provider/health-provider.component';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { ReactiveFormsModule } from "@angular/forms";
import { DemoMaterialModule } from "../demo-material-module";
import { ProfileComponent } from './profile/profile.component';
import { EditRoomComponent } from './edit-room/edit-room.component';
import { HealthRoomComponent } from './health-room/health-room.component';
import { SignatureComponent } from './profile/signature/signature.component';
import { DrawingComponent } from './profile/signature/drawing.component';
import { DataTablesModule } from 'angular-datatables';
import { PatientChartsComponent } from './patient-charts/patient-charts.component';
import { PatientComponent } from './patient/patient/patient.component';


@NgModule({
  declarations: [AdminComponent, SuperComponent, HealthProviderComponent, 
    DialogBoxComponent, ProfileComponent, InviteBySms, EditRoomComponent, HealthRoomComponent, 
    SignatureComponent,DrawingComponent,PatientChartsComponent, PatientComponent],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    DemoMaterialModule,
    Ng2TelInputModule,
    DashboardRoutingModule,
    DataTablesModule,
  ],
  providers: [],
  entryComponents: [DialogBoxComponent]
})
export class DashboardModule { }
