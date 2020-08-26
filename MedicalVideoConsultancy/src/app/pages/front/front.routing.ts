import {Routes} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {PatientComponent} from "./patient/patient.component";
import {DefaultComponent} from "../layouts/default/default.component";

export const FrontRoutes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent,
        pathMatch: 'full'
      },
      {
        path: 'patient',
        component: PatientComponent,
        pathMatch: 'full'
      },
    ]
  }
];
