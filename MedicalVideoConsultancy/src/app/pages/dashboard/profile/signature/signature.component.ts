import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css']
})
export class SignatureComponent {
  name = 'Angular';
  resize(){
    console.log('ddd')
  }
}
