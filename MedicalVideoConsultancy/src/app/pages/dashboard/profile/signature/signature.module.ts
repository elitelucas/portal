import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { SignatureComponent } from './signature.component';
import { DrawingComponent } from './drawing.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ SignatureComponent, DrawingComponent ],
})
export class Signature { }