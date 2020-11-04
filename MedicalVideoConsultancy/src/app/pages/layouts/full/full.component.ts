import { MediaMatcher } from '@angular/cdk/layout';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  AfterViewInit, OnInit
} from '@angular/core';
import { AuthService } from '../../../_services/auth.service';
import { MenuItems } from '../../shared/menu-items/menu-items';

/** @title Responsive sidenav */
@Component({
  selector: 'app-full-layout',
  templateUrl: 'full.component.html'
})
export class FullComponent implements OnInit, OnDestroy, AfterViewInit {
  mobileQuery: MediaQueryList;
  currentUser: any;
  daysEndSubcriptions: Number;
  daysEndFreeUse: Number;

  private _mobileQueryListener: () => void;

  constructor(
    private authService: AuthService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.currentUser = this.authService.getCurrentUser;
    console.log("this.currentUser");
    console.log(this.currentUser);
    if (this.currentUser.endDate != null) {
      let now = new Date();
      let newDate = new Date(this.currentUser.endDate);

      let seconds = (newDate.getTime() - now.getTime()) / 1000;
      let minutes = (seconds) / 60;
      let hours = (minutes) / 60;
      let days = (hours) / 24;
      this.daysEndSubcriptions = Math.round(days);
    }
    if (this.currentUser.freeUseTime != null) {
      let seconds = parseInt(this.currentUser.freeUseTime) / 1000;
      let minutes = (seconds) / 60;
      let hours = (minutes) / 60;
      let days = (hours) / 24;
      this.daysEndFreeUse = Math.round(days);
    }

  }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  ngAfterViewInit() { }

}
