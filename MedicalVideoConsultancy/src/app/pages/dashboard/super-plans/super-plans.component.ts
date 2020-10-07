import { ProviderService } from './../../../_services/provider.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import  Swal  from 'sweetalert2';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';


@Component({
  selector: 'app-super-plans',
  templateUrl: './super-plans.component.html',
  styleUrls: ['./super-plans.component.css']
})
export class SuperPlansComponent implements OnInit {
  public Editor = ClassicEditor;


  planForm:FormGroup;
  submitted=false;
  displayData=false;
  iteralData=[];

  kk = [];
  tmpKk = [];

  @ViewChild('newDescription') newDescription;
  newDescriptionElement;

  constructor(
    private formBuilder: FormBuilder,
    private providerService:ProviderService
    ) { }

  ngOnInit(): void {
    this.planForm=this.formBuilder.group({
      name:['',Validators.required],
      amount:['',[Validators.required, Validators.pattern('[0-9]*')]],
    })

    this.providerService.getPlans().subscribe(res=>{
      this.tmpKk=[];
      this.iteralData=res;
      this.iteralData.forEach(item=>{
        this.tmpKk.push(true)
      })
      this.kk=this.tmpKk;
      this.displayData=true;
    })
  }
  get f() {return this.planForm.controls;}

  onSubmit(descriptionData){
    this.submitted=true;
    if(this.planForm.invalid)
    return;
    const sendData={
      name:this.f.name.value,
      amount:this.f.amount.value,
      description:descriptionData,
      currency_code:'us'
    }
    this.providerService.createPlan(sendData).subscribe(res=>{
      this.iteralData.push(res);
      this.tmpKk = [];
      this.iteralData.forEach(item => {
        this.tmpKk.push(true)
      })
      this.kk = this.tmpKk;
  
      this.onReset();
      this.Editor.editorInstance['newDescription'].setData('');
    })
  }

  onReset() {
    this.submitted = false;
    this.planForm.reset();
  }
  Edit(idx){
    this.kk[idx] = false;
  }
  EditOk(name, description, amount, id,i){
    this.providerService.updatePlans({name, description, amount, id}).subscribe(res=>{
      this.iteralData.splice(i, 1, res);
      this.tmpKk = [];
      this.iteralData.forEach(item => {
        this.tmpKk.push(true)
      })
      this.kk = this.tmpKk;
    })

  }
  EditCancel(idx){
    this.kk[idx] = true;
  }
  Delete(planId,idx){
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.providerService.deletePlans(planId)
          .subscribe(res => {
            this.iteralData.splice(idx, 1);
            Swal.fire(
              'Deleted!',
              'Your file has been deleted.',
              'success'
            )
          })
      }
    })
  }
}
