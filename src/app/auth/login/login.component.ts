import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService, TokenService, User, UtilService, Constants, DataService } from 'src/app/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tmc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private host = `${window.location.protocol}//${window.location.host}`
  private googleRegistrationURL: string = environment.name + "/oauth2/authorize/google?redirect_uri=" + this.host + "/projects";
  private githubRegistrationURL: string = environment.name + "/oauth2/authorize/github?redirect_uri=" + this.host + "/projects";
  private facebookRegistrationURL: string = environment.name + "/oauth2/authorize/facebook?redirect_uri=" + this.host + "/projects";

  //User variables
  private user: User;

  //Form variable
  private loginForm: FormGroup;

  //Variable which allows control requsts
  private isRequest: boolean = false;

  //errors variables
  private isError: boolean = false;

  private routeSubscription: Subscription;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private notification: NzNotificationService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private utilService: UtilService,
    private dataService: DataService
  ) {
    this.user = new User(); 
  }

  ngOnInit() {
    this.user.username = "";
    // this.routeSubscription = this.activateRoute.queryParams.subscribe((queryParam: any) => {
    //   if (queryParam['OAuth2'] != null) {
    //     this.tokenService.storeOauth2Token(queryParam['OAuth2']);
    //     this.dataService.reloadUserForHeader('true');
    //   }
    // });
    this.loginForm = new FormGroup({
      'login': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\d\\._]{4,27}$ || ^([\\w\\-\\.]+)@((\\[([0-9]{1,3}\\.){3}[0-9]{1,3}\\])|(([\\w\\-]+\\.)+)([a-zA-Z]{2,4}))$')
      ]),
      'password': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\d\\._]{6,27}$')
      ])
    });
  }

  login() {
    for (const key in this.loginForm.controls) {
      this.loginForm.controls[key].markAsDirty();
      this.loginForm.controls[key].updateValueAndValidity();
    }
    if (this.loginForm.valid) {
      if (!this.isRequest) {
        this.isRequest = true;
        this.user.username = this.loginForm.get('login').value;
        this.user.password = this.loginForm.get('password').value;
        this.userService.login(this.user).subscribe((data: JSON) => {
          const a = JSON.stringify(data);
          JSON.parse(a, (key, value) => {
            if (key === 'Token') {
              this.tokenService.setAccess(value);
            }
            if (key === 'Refresh') {
              this.tokenService.setRefresh(value);
            }
          });
          this.isRequest = false;
          this.dataService.reloadUserForHeader('true');
          this.router.navigateByUrl('/projects');
        }, error => {
          this.isRequest = false;
          if (error.status == 400) {
            this.isError = true;
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.login'));
          }
        });
      }
    }
  }

}
