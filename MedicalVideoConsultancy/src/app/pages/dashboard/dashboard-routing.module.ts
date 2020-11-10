import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {FullComponent} from "../layouts/full/full.component";
import {HealthProviderComponent} from "./health-provider/health-provider.component";
import {AdminComponent} from "./admin/admin.component";
import {SuperComponent} from "./super/super.component";
import {ProfileComponent} from "./profile/profile.component";
import {EditRoomComponent} from "./edit-room/edit-room.component";
import { HealthRoomComponent } from './health-room/health-room.component';
import { PatientChartsComponent } from './patient-charts/patient-charts.component';
import { PatientComponent } from './patient/patient.component';
import { NewConsultComponent } from './new-consult/new-consult.component';
import { PayProviderComponent } from './pay-provider/pay-provider.component';
import { SuperProvidersComponent } from './super-providers/super-providers.component';
import { SuperAdministratorsComponent } from './super-administrators/super-administrators.component';
import { SuperFeedbacksComponent } from './super-feedbacks/super-feedbacks.component';
import { SuperPlansComponent } from './super-plans/super-plans.component';
import { SubscriptionPlanComponent } from './subscription-plan/subscription-plan.component';
import { SubscriptionOldComponent } from './subscription-old/subscription-old.component';
import { SubscriptionNewComponent } from './subscription-new/subscription-new.component';
import { SuperUpdateComponent } from './super-providers/super-update/super-update.component';
import { AdminUpdateComponent } from './super-administrators/admin-update/admin-update.component';
import { SuperUploadedFilesComponent } from './super-uploaded-files/super-uploaded-files.component';
import { UploadEditComponent } from './super-uploaded-files/upload-edit/upload-edit.component';


const routes:Routes = [{
  path: '',
  component: FullComponent,
  children: [
    {
      path: '',
      redirectTo: 'super',
      pathMatch: 'full'
    },

    {
      path: 'profile',
      component: ProfileComponent
    },
    {
      path: 'health-provider',
      component: HealthProviderComponent
    },

    {
      path: 'health-provider/edit-room',
      component: EditRoomComponent
    },
    // {
    //   path: 'health-room/:patientId/:consultId',
    //   component: HealthRoomComponent
    // },

    // {
    //   path: 'pay-provider/:patientId',
    //   component: PayProviderComponent
    // },
    // {
    //   path: 'admin',
    //   component: AdminComponent
    // },
    {
      path: 'analysis',
      component: AdminComponent
    },
    // {
    //   path: 'patient/:id',
    //   component: PatientComponent
    // },
    // {
    //   path: 'newConsult/:index/:id/:consultId',
    //   component: NewConsultComponent
    // },
    // {
    //   path: 'newConsult/new/:id',
    //   component: NewConsultComponent
    // },
    // {
    //   path: 'patient-charts',
    //   component: PatientChartsComponent
    // },
    // {
    //   path: 'subscription-plan',
    //   component: SubscriptionPlanComponent
    // },
    // {
    //   path: 'subscription-old',
    //   component: SubscriptionOldComponent
    // },
    // {
    //   path: 'subscription-new/:planId',
    //   component: SubscriptionNewComponent
    // },
  
    {
      path: 'administrators',
      component: SuperAdministratorsComponent,
    },
    {
      path: 'admin-uploaded-files',
      component: SuperUploadedFilesComponent,
    },
    {
      path: 'upload-update/:id',
      component: UploadEditComponent,
    },
    {
      path: 'super-update/:data',
      component: SuperUpdateComponent,
    },
    {
      path: 'admin-update/:data',
      component: AdminUpdateComponent,
    },
    // {
    //   path: 'feedbacks',
    //   component: SuperFeedbacksComponent,
    // },
    // {
    //   path: 'plans',
    //   component: SuperPlansComponent,
    // },

  ]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
