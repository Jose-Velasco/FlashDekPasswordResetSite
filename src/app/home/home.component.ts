import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, throwError } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { catchError } from "rxjs/operators";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  // adjust base url on production or http request will not work
  baseUrl = "http://ChangeInProduction/password/reset/confirm/";
  httpHeaders = new HttpHeaders ({"Content-Type": "application/json"});
  uid: string;
  token: string;
  paramsSub: Subscription;
  restPasswordSub: Subscription;
  passwordResetForm: FormGroup;
  alertMessage: string;
  isError: boolean;
  isSuccess = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.paramsSub = this.route.paramMap.subscribe(params => {
      this.uid = params.get("uid");
      this.token = params.get("token");
    });

    this.passwordResetForm = this.formBuilder.group({
      newPass1: ["", [Validators.required, Validators.minLength(8)]],
      newPass2: ["", [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if(this.passwordResetForm.invalid) {
      this.isError = true;
      this.alertMessage = "Form is invalid try again"
      return;
    }
    this.isError = false
    const body = {
      uid: this.uid,
      token: this.token,
      new_password1: this.passwordResetForm.value.newPass1,
      new_password2: this.passwordResetForm.value.newPass2
    }
     this.paramsSub = this.postResetPassword(body).subscribe(resData => {
      this.isError = false;
      this.isSuccess = true;
      this.alertMessage = "Password has been reset with the new password. Thank you!";
    }, error => {
      this.isError = true;
      this.isSuccess = false;
      this.alertMessage = "Error while processing your request try again";
    })

  }

  postResetPassword(body: {uid:string, token: string, new_password1:string, new_password2: string}): Observable<any> {
    return this.http.post(this.baseUrl, body, {headers: this.httpHeaders}).pipe(
      catchError(errorRes => {
        return throwError(errorRes);
      })
    );
  }

  ngOnDestroy() {
    if(this.paramsSub) {
      this.paramsSub.unsubscribe();
    }
    if(this.restPasswordSub) {
      this.restPasswordSub.unsubscribe();
    }
  }

}
