import { Injectable } from '@angular/core';

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
}


@Injectable()
export class MenuItems {


  MENUITEMS_SUPER = [
    { state: 'super', name: 'Dashboard', type: 'link', icon: 'av_timer' },
    { state: 'profile', name: 'Profile', type: 'link', icon: 'https://img.icons8.com/doodle/48/000000/user.png' },
    { state: 'providers', name: 'Providers', type: 'link', icon: 'https://img.icons8.com/doodle/48/000000/doctor-male.png' },
    { state: 'administrators', name: 'Administrators', type: 'link', icon: 'https://img.icons8.com/doodle/48/000000/doctor-male.png' },
    { state: 'feedbacks', name: 'Feedbacks', type: 'link', icon: 'https://img.icons8.com/doodle/48/000000/doctor-male.png' },
    { state: 'plans', name: 'Plans', type: 'link', icon: 'https://img.icons8.com/doodle/48/000000/doctor-male.png' }
  ];

  MENUITEMS_ADMIN = [
    { state: 'admin', type: 'link', name: 'Health Provider', icon: 'https://img.icons8.com/doodle/48/000000/doctor-male.png' },
    { state: 'admin/patient', type: 'link', name: 'Patient', icon: 'https://img.icons8.com/officel/16/000000/hospital-bed.png' },
    { state: 'profile', name: 'Profile', type: 'link', icon: 'https://img.icons8.com/doodle/48/000000/user.png' }
  ];

  MENUITEMS_USER = [
    { state: 'health-provider', name: 'Dashboard', type: 'link', icon: 'av_timer' },
    { state: 'health-provider/edit-room', name: 'Edit Waiting Room', type: 'link', icon: 'https://img.icons8.com/color/48/000000/waiting-room.png' },
    { state: 'profile', name: 'Profile', type: 'link', icon: 'https://img.icons8.com/doodle/48/000000/user.png' },
    { state: 'feedbacks', name: 'Feedbacks', type: 'link', icon: 'https://img.icons8.com/color/50/000000/physical-therapy.png' },
    { state: 'subscription-plan', name: 'Subscription Plan', type: 'link', icon: 'https://img.icons8.com/color/50/000000/physical-therapy.png' },
    { state: 'patient-charts', name: 'Patient Charts', type: 'link', icon: 'https://img.icons8.com/color/50/000000/physical-therapy.png' }
  ];

  MENUITEMS_FRONT = [
    { state: 'home', type: 'link', name: 'Home', icon: 'https://img.icons8.com/officel/16/000000/home.png' },
    { state: 'patient', type: 'link', name: 'For Patients', icon: 'https://img.icons8.com/officel/16/000000/hospital-bed.png' },
    { state: 'provider', type: 'link', name: 'For Providers', icon: 'https://img.icons8.com/doodle/16/000000/doctor-male.png' },
    { state: 'clinics', type: 'link', name: 'For Clinics', icon: 'https://img.icons8.com/officel/16/000000/clinic.png' },
    { state: 'pricing', type: 'link', name: 'Pricing', icon: 'https://img.icons8.com/officel/16/000000/money.png' }
  ];


  constructor() {
    console.log("constructor MENUITEMS_USER  :");
    console.log(this.MENUITEMS_USER);
  }

  getMenuitem(role): Menu[] {
    if (role == "SuperAdmin") {
      return this.MENUITEMS_SUPER;
    } else if (role == "Admin") {
      return this.MENUITEMS_ADMIN;
    } else if (role == "front") {
      return this.MENUITEMS_FRONT;
    }
    else {
      console.log("MENUITEMS_USER");
      console.log(this.MENUITEMS_USER);
      return this.MENUITEMS_USER;
    }
  }
}
