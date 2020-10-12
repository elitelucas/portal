import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackService } from '../../../_services/feedback.service';

@Component({
  selector: 'app-feeback',
  templateUrl: './feeback.component.html',
  styleUrls: ['./feeback.component.css']
})
export class FeebackComponent implements OnInit {

  @Input() patientData: any;
  @Input() providerData: any;
  @Input() roomName: any;

  feedBackForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private feedback: FeedbackService,
    private _router: Router) {
    this.feedBackForm = this.formBuilder.group({
      rakingProvider: ['', [Validators.required, Validators.minLength(1)]],
      feedBackProvider: ['', [Validators.required, Validators.minLength(2)]],
      rakingApp: ['', [Validators.required, Validators.minLength(1)]],
      feedBackApp: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
  }

  get f() { return this.feedBackForm.controls; }

  sendFeedBack() {
    if(this.feedBackForm.valid){
      this.feedback.save(this.providerData._id,this.patientData._id,this.feedBackForm.value).subscribe((res) => {
        this._router.navigateByUrl('/');
      });
    }

  }

}
