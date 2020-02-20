import { Component, OnInit } from '@angular/core';
import { UtilService, TokenService, UserService, User, Constants, DataService } from 'src/app/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, ValidationErrors, FormBuilder, Validators } from '@angular/forms';
import { Observer, Observable } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'tmc-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  private user: User;
  private registerForm: FormGroup;

  //errors variables
  private isRequest: boolean = false;
  private isError: boolean = false;
  private usernameFree: boolean = true;
  private emailFree: boolean = true;
  private errorText: string = '';

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
    private utilService: UtilService,
    private notification: NzNotificationService,
    private dataService: DataService
  ) {
    this.user = new User();
  }

  ngOnInit() {
    this.registerForm = new FormGroup({
      'username': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\d\\._]{4,27}$')
      ]),
      'email': new FormControl(null, [
        Validators.required,
        Validators.pattern('^([\\w\\-\\.]+)@((\\[([0-9]{1,3}\\.){3}[0-9]{1,3}\\])|(([\\w\\-]+\\.)+)([a-zA-Z]{2,4}))$')
      ]),
      'name': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Zа-яА-Я]{2,27}')
      ]),
      'surname': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Zа-яА-Я]{2,27}')
      ]),
      'password': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\d\\._]{6,27}$')
      ]),
      'repeat': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\d\\._]{6,27}$')
      ])
    });

    this.registerForm.get('username').valueChanges.subscribe((data: any) => {
      const username: string = this.registerForm.get('username').value;
      this.usernameFree = true;
      if (username && username.length > 4) {
        this.userService.checkUsername(username).subscribe((data: boolean) => {
          this.usernameFree = data;
        });
      }
    });
    this.registerForm.get('email').valueChanges.subscribe((data: any) => {
      const email: string = this.registerForm.get('email').value;
      this.emailFree = true;
      if (email && email.length > 4) {
        this.userService.checkEmail(email).subscribe((data: boolean) => {
          this.emailFree = data;
        });
      }
    });
  }


  registration() {
    for (let key in this.registerForm.controls) {
      this.registerForm.controls[key].markAsDirty();
      this.registerForm.controls[key].updateValueAndValidity();
    }
    this.isError = false;
    if (this.registerForm.valid) {
      this.user.username = this.registerForm.get('username').value;
      this.user.firstName = this.registerForm.get('name').value;
      this.user.lastName = this.registerForm.get('surname').value;
      this.user.email = this.registerForm.get('email').value;
      this.user.password = this.registerForm.get('password').value;
      this.user.repeatPassword = this.registerForm.get('repeat').value;
      if (!this.isRequest && this.user.password == this.user.repeatPassword) {
        this.isRequest = true;
        this.userService.registration(this.user).subscribe((data: JSON) => {
          const a = JSON.stringify(data);
          JSON.parse(a, (key, value) => {
            if (key === 'Token') {
              this.tokenService.setAccess(value);
            }
            if (key === 'Refresh') {
              this.tokenService.setRefresh(value);
            }
          });
          this.router.navigateByUrl('/projects');
          this.dataService.reloadUserForHeader('true');
        }, error => {
          this.isRequest = false;
          this.isError = true;
          if (error.status === 421) {
            this.errorText = this.getTranslation('error.username.email.exists');
          } else if (error.status === 422) {
            this.errorText = this.getTranslation('error.username.exists');
          } else if (error.status === 423) {
            this.errorText = this.getTranslation('error.email.exists');
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.register'));
          }
        });
      }
      else if (this.user.password != this.user.repeatPassword) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('passwords.arent.equals'));
      }
    }
  }

  getTranslation(string: string): string {
    return this.utilService.getTranslation(string);
  }

}
