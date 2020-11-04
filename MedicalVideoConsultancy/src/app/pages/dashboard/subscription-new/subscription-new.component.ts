import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from './../../../_services/provider.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../_services/auth.service';
import { MeetRoomService } from '../../../_services/meet-room.service';


@Component({
  selector: 'app-subscription-new',
  templateUrl: './subscription-new.component.html',
  styleUrls: ['./subscription-new.component.css']
})
export class SubscriptionNewComponent implements OnInit {
  currectUser: any;

  cardForm: FormGroup;
  submitted = false;
  planId: any;
  receiveData: any;
  displayPlan = false;
  planData: any = null;
  cardData: any;
  buttonText: string;

  constructor(
    private authService: AuthService,
    private meetRoomService: MeetRoomService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private providerService: ProviderService,
    private router: Router
  ) {



    this.currectUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('this.currectUser')
    console.log(this.currectUser)

    this.receiveData = JSON.parse(localStorage.getItem("plan_select"));
    console.log('this.receiveData')
    console.log(this.receiveData)

  }

  ngOnInit(): void {
    this.planId = this.receiveData.val;

    this.providerService.getPlansById(this.planId)
      .subscribe(res => {
        this.planData = res;
        console.log('this.planData')
        console.log(this.planData)
        this.displayPlan = true;
        if (this.receiveData.key === 'new') {
          if (this.planData.type === 'charge') {
            this.buttonText = 'Charge';
          } else {
            this.buttonText = 'Subscribe';
          }
        } else {
          this.buttonText = 'Update';
          this.providerService.getCard(this.currectUser.id)
            .subscribe(res => {
              this.cardData = res;
              this.cardForm = this.formBuilder.group({
                cardNumber: [this.cardData ? this.cardData.card_number : '', Validators.required],
                cvv: [this.cardData ? this.cardData.cvv : '', Validators.required],
                month: [this.cardData ? this.cardData.month : '', [Validators.required, Validators.pattern('[0-9]*')]],
                year: [this.cardData ? this.cardData.year : '', [Validators.required, Validators.pattern('[0-9]*')]],
                firstName: [this.currectUser.firstName, Validators.required],
                lastName: [this.currectUser.lastName, Validators.required],
                email: [this.currectUser.email, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'), Validators.required]],
                address: ['', Validators.required],
                addressCity: ['', Validators.required],
                country: [this.currectUser.country, Validators.required],
              });
            })
        }
      });


    this.cardForm = this.formBuilder.group({
      cardNumber: [this.cardData ? this.cardData.card_number : '', Validators.required],
      cvv: [this.cardData ? this.cardData.cvv : '', Validators.required],
      month: [this.cardData ? this.cardData.month : '', [Validators.required, Validators.pattern('[0-9]*')]],
      year: [this.cardData ? this.cardData.year : '', [Validators.required, Validators.pattern('[0-9]*')]],
      firstName: [this.currectUser.firstName, Validators.required],
      lastName: [this.currectUser.lastName, Validators.required],
      email: [this.currectUser.email, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'), Validators.required]],
      address: ['', Validators.required],
      addressCity: ['', Validators.required],
      country: [this.currectUser.country, Validators.required],
    });
  }

  get f() { return this.cardForm.controls; }

  onSubmit() {
    console.log('sdsdf')
    this.submitted = true;
    if (this.cardForm.invalid) {
      return;
    }
    console.log('this.planData.type')
    console.log(this.planData.type)

    if (this.planData.type === 'charge') {
      const sendData = {
        chargeData: {
          providerId: this.currectUser.id,
          planId: this.planId,
          card_number: this.f.cardNumber.value,
          cvv: this.f.cvv.value,
          expiration_month: this.f.month.value,
          expiration_year: this.f.year.value,
          email: this.f.email.value
        }
      }
      console.log('sendData')
      console.log(sendData)
      this.providerService.chargePayPLan(sendData).subscribe(ress => {
        const mailData = {
          email: this.currectUser.email,
          subject: 'Subscribed successfully.',
          html: '<p>Subscribed successfully.</p>'
        }
        console.log('mailData')
        console.log(mailData)
        this.providerService.sendMailForSubscription(mailData).subscribe(res => {
          console.log('res')
          console.log(res)

          this.currectUser.payToDay = true
          this.authService.refreshCurrentUser(this.currectUser);
          Swal.fire('Subscribed successfully.').then((result) => {
            //this.router.navigated = false;
            //this.router.navigateByUrl('/dashboard/subscription-plan');
            this.reloadCurrentRoute('/dashboard/subscription-plan');
          });
        })
      });
    } else {
      const sendData = {
        providerId: this.currectUser.id,
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
          phone_number: this.currectUser.phoneNumber,
        },
        subcription: {
          id: this.planId
        }
      }
      console.log('sendData')
      console.log(sendData)
      this.providerService.sendSubcriptionData(sendData).subscribe(ress => {
        const mailData = {
          email: this.currectUser.email,
          subject: 'Subscribed successfully.',
          html: '<p>Subscribed successfully.</p>'
        }
        console.log('mailData')
        console.log(mailData)
        this.providerService.sendMailForSubscription(mailData).subscribe(res => {
          console.log('res')
          console.log(res)

          this.currectUser.payToDay = true
          this.authService.refreshCurrentUser(this.currectUser);
          Swal.fire('Subscribed successfully.').then((result) => {
            //this.router.navigated = false;
            this.reloadCurrentRoute('/dashboard/subscription-plan');
          });
        })

      })
    }

  }

  Cancel() {
    if (this.cardData)
      this.router.navigate(['/dashboard/dashboard/subscription-old']);
    else
      this.router.navigate(['/dashboard/subscription-plan']);

  }

  reloadCurrentRoute(url) {
    //this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() => {
    this.router.navigate([url]).then(() => {
      window.location.reload();
    });
    //});
  }

}
