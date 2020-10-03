import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProviderService } from './../../../_services/provider.service';


@Component({
  selector: 'app-subscription-new',
  templateUrl: './subscription-new.component.html',
  styleUrls: ['./subscription-new.component.css']
})
export class SubscriptionNewComponent implements OnInit {
  cardForm:FormGroup;
  submitted=false;
  providerData:any;
  planId:any;
  displayPlan=false;
  planData:any;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute:ActivatedRoute,
    private providerService:ProviderService
    ) { 
    this.providerData=JSON.parse(localStorage.getItem('currentUser'));

    this.activatedRoute.params.subscribe(data=>{

      this.planId=data.planId;
      this.providerService.getPlansById(this.planId)
      .subscribe(res=>{
        console.log('resasdasd')
        console.log(res)
        this.planData=res;
        this.displayPlan=true;
      })
    })
  }

  ngOnInit(): void {
    this.cardForm = this.formBuilder.group({
      cardNumber: ['', Validators.required],
      cvv: ['', Validators.required],
      month: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      year: ['', [Validators.required, Validators.pattern('[0-9]*')]],
      firstName: [this.providerData.firstName, Validators.required],
      lastName: [this.providerData.lastName, Validators.required],
      email: [this.providerData.email, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'), Validators.required]],
      address: ['', Validators.required],
      addressCity: ['', Validators.required],
      country: [this.providerData.country, Validators.required],
    });
  }
  get f() { return this.cardForm.controls; }
  onSubmit() {
    console.log('sdsdf')
    this.submitted = true;
    if (this.cardForm.invalid) {
      return;
    }
    const sendData={
      providerId:this.providerData.id,
      card:{
        card_number:this.f.cardNumber.value,       
        cvv:this.f.cvv.value,       
        expiration_month:this.f.month.value,       
        expiration_year:this.f.year.value,       
        email:this.f.email.value,       
        first_name:this.f.firstName.value,       
        last_name:this.f.lastName.value,       
        address:this.f.address.value,       
        address_city:this.f.addressCity.value,       
        country_code:this.f.country.value,       
        phone_number:this.providerData.phoneNumber,       
      },
      subcription:{
        id:this.planId
      }
    }
    this.providerService.sendSubcriptionData(sendData).subscribe(res=>{
      console.log('res')
      console.log(res)
    })
  }


}
