import { Component, Input, ViewChild, OnInit, HostListener } from '@angular/core';
import { DataService } from "../../../../_services/data.service";

@Component({
  selector: 'drawing',
  template: `
  <div style="width:80%">
  <div id="parent" style="width:100%;"  (window:resize)="onResize($event)">
  <canvas #sigPad height="150" (mousedown)="onMouseDown($event)"
  (mousemove)="onMouseMove($event)"></canvas>
  </div>
  </div>
  <br/>
  <button (click)="save()" class="btn btn-primary pull-right">Update signature</button>
  <button (click)="clear()" class="btn btn-danger pull-right">clear</button>
  <br/>
  <img [src]="img">
  <br/>`,
  styles: [`
  canvas {
    border: 1px solid #000;
  }
  button {
    margin-right:10px;
  }
  `]
})
export class DrawingComponent implements OnInit {
  @Input() name: string;
  @ViewChild('sigPad') sigPad;
  sigPadElement;
  context;
  isDrawing = false;
  img;
  message:string;
  constructor(private data: DataService){

  }

  ngOnInit() {
    this.data.currentMessage.subscribe(message => this.message = message)
  }

  ngAfterViewInit() {
    this.sigPadElement = this.sigPad.nativeElement;
    this.context = this.sigPadElement.getContext('2d');
    this.context.strokeStyle = '#3742fa';
    var parent = document.getElementById("parent");
    this.sigPadElement.width = parent.clientWidth;
  }


  @HostListener('document:mouseup', ['$event'])
  onMouseUp(e) {
    this.isDrawing = false;
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const coords = this.relativeCoords(e);
    this.context.moveTo(coords.x, coords.y);
  }

  onMouseMove(e) {
    if (this.isDrawing) {
      const coords = this.relativeCoords(e);
      this.context.lineTo(coords.x, coords.y);
      this.context.stroke();
    }
  }
  onResize(event){
      this.sigPadElement.width = event.target.innerWidth*0.7;
  }

  private relativeCoords(event) {
    const bounds = event.target.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    return { x: x, y: y };
  }

  clear() {
    this.context.clearRect(0, 0, this.sigPadElement.width, this.sigPadElement.height);
    this.context.beginPath();
  }

  save() {
    this.img = this.sigPadElement.toDataURL("image/png");
    console.log(this.img);
    this.data.changeMessage(this.img);
  }

}
