import { NgModule } from '@angular/core';

import { MenuItems } from './menu-items/menu-items';
import { AccordionAnchorDirective, AccordionLinkDirective, AccordionDirective } from './accordion';

import {VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule} from "ngx-videogular";
import {WebcamModule} from 'ngx-webcam';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    WebcamModule
  ],
  exports: [
    CommonModule,
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    FormsModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    WebcamModule

   ],
  providers: [ MenuItems ]
})
export class SharedModule { }
