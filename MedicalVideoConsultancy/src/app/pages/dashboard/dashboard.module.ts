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
import { DrawingComponent } from './profile/signature/drawing/drawing.component';
import { DataTablesModule } from 'angular-datatables';
import { PatientChartsComponent } from './patient-charts/patient-charts.component';
import { PatientComponent } from './patient/patient.component';
import { ConsultListComponent } from './patient/consult-list/consult-list.component';
import { FreeTextComponent } from './patient/free-text/free-text.component';
import { NewConsultComponent } from './new-consult/new-consult.component';
import { PrescriptionComponent } from './health-room/prescription/prescription.component';
import { ConsultsComponent } from './health-room/consults/consults.component';
import { FilesComponent } from './health-room/files/files.component';
import { ChartsComponent } from './health-room/charts/charts.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { PayProviderComponent } from './pay-provider/pay-provider.component';
import { PayMethodComponent } from './profile/pay-method/pay-method.component';
import { ConsultDialogueComponent } from './health-room/consult-dialogue/consult-dialogue.component';
import { SuperProvidersComponent } from './super-providers/super-providers.component';
import { SuperAdministratorsComponent } from './super-administrators/super-administrators.component';
import { SuperFeedbacksComponent } from './super-feedbacks/super-feedbacks.component';
import { SuperPlansComponent } from './super-plans/super-plans.component';
import { SubscriptionPlanComponent } from './subscription-plan/subscription-plan.component';
import { SubscriptionOldComponent } from './subscription-old/subscription-old.component';
import { SubscriptionNewComponent } from './subscription-new/subscription-new.component';


@NgModule({
  declarations: [AdminComponent, SuperComponent, HealthProviderComponent, 
    DialogBoxComponent, ProfileComponent, InviteBySms, EditRoomComponent, HealthRoomComponent, 
    SignatureComponent,DrawingComponent,PatientChartsComponent, PatientComponent, ConsultListComponent, FreeTextComponent, NewConsultComponent, PrescriptionComponent, ConsultsComponent, FilesComponent, ChartsComponent, PayProviderComponent, PayMethodComponent, ConsultDialogueComponent, SuperProvidersComponent, SuperAdministratorsComponent, SuperFeedbacksComponent, SuperPlansComponent, SubscriptionPlanComponent, SubscriptionOldComponent, SubscriptionNewComponent],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    DemoMaterialModule,
    Ng2TelInputModule,
    DashboardRoutingModule,
    DataTablesModule,
    CKEditorModule,
  ],
  providers: [],
  entryComponents: [DialogBoxComponent]
})
export class DashboardModule { }
