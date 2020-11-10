import { Routes } from '@angular/router';
import {AuthGuard} from "../_helpers/auth.guard";
//import {MeetRoomComponent} from "./meet-room/meet-room.component";
//import { VideoRoomComponent } from "./video-room/video-room.component";
//import { MeetCallComponent } from './pay-patient/meet-call/meet-call.component';
//import { PayPatientComponent } from './pay-patient/pay-patient.component';
import { MeetPatientComponent } from './meet-patient/meet-patient.component';

export const AppRoutes: Routes = [
  {
    path: '',
    redirectTo: 'auth/sign-in',
    pathMatch: 'full'
  },

  {
    path: 'super',
    redirectTo: 'auth',
    pathMatch: 'full'
  },

  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },


  {
    path: ':roomName',
    //component: MeetRoomComponent
    component: MeetPatientComponent
  }/*,
  {
    path: 'payAttetion/:roomName',
    component: PayPatientComponent
  },
  {
    path: 'attetion/:roomName',
    component: MeetCallComponent
  },*/
];


