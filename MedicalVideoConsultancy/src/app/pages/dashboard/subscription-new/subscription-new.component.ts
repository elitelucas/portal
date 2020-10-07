import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from './../../../_services/provider.service';


@Component({
  selector: 'app-subscription-new',
  templateUrl: './subscription-new.component.html',
  styleUrls: ['./subscription-new.component.css']
})
export class SubscriptionNewComponent implements OnInit {
  cardForm: FormGroup;
  submitted = false;
  providerData: any;
  planId: any;
  receiveData:any;
  displayPlan = false;
  planData: any;
  cardData:any;
  buttonText:string;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private providerService: ProviderService,
    private router: Router
  ) {
    this.providerData = JSON.parse(localStorage.getItem('currentUser'));

    this.activatedRoute.params.subscribe(data => {
      this.receiveData=JSON.parse(data.planId);
      if(this.receiveData.key==='new'){
        this.planId = this.receiveData.val;
        this.buttonText='Subscribe';
      }else{
        this.planId = this.receiveData.val;
        this.buttonText='Update';
        this.providerService.getCard(this.providerData.id)
        .subscribe(res => {

          this.cardData=res;
          this.cardForm = this.formBuilder.group({
            cardNumber: [this.cardData?this.cardData.card_number:'', Validators.required],
            cvv: [this.cardData?this.cardData.cvv:'', Validators.required],
            month: [this.cardData?this.cardData.month:'', [Validators.required, Validators.pattern('[0-9]*')]],
            year: [this.cardData?this.cardData.year:'', [Validators.required, Validators.pattern('[0-9]*')]],
            firstName: [this.providerData.firstName, Validators.required],
            lastName: [this.providerData.lastName, Validators.required],
            email: [this.providerData.email, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'), Validators.required]],
            address: ['', Validators.required],
            addressCity: ['', Validators.required],
            country: [this.providerData.country, Validators.required],
          });
        })
      }
      
      this.providerService.getPlansById(this.planId)
        .subscribe(res => {
          this.planData = res;
          console.log('this.planData')
          console.log(this.planData)
          this.displayPlan = true;
        })
    })
  }

  ngOnInit(): void {

    this.cardForm = this.formBuilder.group({
      cardNumber: [this.cardData?this.cardData.card_number:'', Validators.required],
      cvv: [this.cardData?this.cardData.cvv:'', Validators.required],
      month: [this.cardData?this.cardData.month:'', [Validators.required, Validators.pattern('[0-9]*')]],
      year: [this.cardData?this.cardData.year:'', [Validators.required, Validators.pattern('[0-9]*')]],
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
    const sendData = {
      providerId: this.providerData.id,
      card: {
        card_number: this.f.cardNumber.value,
        cvv: this.f.cvv.value,
        expiration_month: this.f.month.value,
        expiration_year: this.f.year.value,
        email: this.f.email.value,
        first_name: this.f.firstName.value,
        last_name: this.f.lastName.value,
        address: this.f.address.value,
        address_city: this.f.addressCity.value,
        country_code: this.f.country.value,
        phone_number: this.providerData.phoneNumber,
      },
      subcription: {
        id: this.planId
      }
    }
    console.log('sendData')
    console.log(sendData)
    this.providerService.sendSubcriptionData(sendData).subscribe(res => {
      console.log('res')
      console.log(res)
    })
  }
  Cancel() {
    if(this.cardData)
    this.router.navigateByUrl('/dashboard/subscription-old');
    else
    this.router.navigateByUrl('/dashboard/subscription-plan');

  }


}
